"""
Forecast brain. O(n) work, n = history days.
Pull booking count per day -> smooth -> Holt-Winters -> forecast.
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate

from apps.bookings.models import Booking  # <-- fix import path to your real booking app/model


def get_daily_booking_counts(days_back=180):
    start = timezone.now().date() - timedelta(days=days_back)
    qs = (Booking.objects
          .filter(created_at__date__gte=start)
          .annotate(day=TruncDate('created_at'))
          .values('day')
          .annotate(count=Count('id'))
          .order_by('day'))

    series = {row['day']: row['count'] for row in qs}
    full = []
    d = start
    today = timezone.now().date()
    while d <= today:
        full.append(series.get(d, 0))
        d += timedelta(days=1)
    return full


def moving_average(data, window=7):
    if len(data) < window:
        return sum(data) / len(data) if data else 0
    return sum(data[-window:]) / window


def exponential_smoothing(data, alpha=0.3):
    if not data:
        return []
    smoothed = [data[0]]
    for t in range(1, len(data)):
        smoothed.append(alpha * data[t] + (1 - alpha) * smoothed[t - 1])
    return smoothed


def holt_winters_forecast(data, horizon=14, period=7, alpha=0.3, beta=0.1, gamma=0.2):
    n = len(data)
    if n < 2 * period:
        avg = moving_average(data, window=min(7, n) or 1)
        return [avg] * horizon

    L = [sum(data[0:period]) / period]
    T = [(sum(data[period:2 * period]) - sum(data[0:period])) / (period ** 2)]
    S = [data[i] - L[0] for i in range(period)]

    for t in range(period, n):
        Yt = data[t]
        prev_S = S[t - period]
        Lt = alpha * (Yt - prev_S) + (1 - alpha) * (L[-1] + T[-1])
        Tt = beta * (Lt - L[-1]) + (1 - beta) * T[-1]
        St = gamma * (Yt - Lt) + (1 - gamma) * prev_S
        L.append(Lt); T.append(Tt); S.append(St)

    last_L, last_T = L[-1], T[-1]
    forecast = []
    for m in range(1, horizon + 1):
        idx = (n - period + m) % period
        s_val = S[len(S) - period + idx] if len(S) >= period else 0
        Ft = last_L + m * last_T + s_val
        forecast.append(max(0, round(Ft, 1)))
    return forecast


def forecast_occupancy(horizon=14, save_cache=True):
    history = get_daily_booking_counts(days_back=180)
    if not history:
        return {"history": [], "forecast": [], "moving_avg": 0, "peak_day_index": None}

    ma = moving_average(history, window=7)
    smoothed = exponential_smoothing(history)
    forecast = holt_winters_forecast(history, horizon=horizon)

    result = {
        "history": history,
        "smoothed": [round(x, 1) for x in smoothed],
        "moving_avg": round(ma, 1),
        "forecast": forecast,
        "peak_day_index": forecast.index(max(forecast)) if forecast else None,
    }

    if save_cache:
        from .models import ForecastCache
        ForecastCache.objects.create(
            horizon=horizon,
            history_json=history,
            forecast_json=forecast,
            moving_avg=result["moving_avg"],
        )

    return result
