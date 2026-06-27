from django.db import models

class ForecastCache(models.Model):
    """
    Optional cache table, MySQL-friendly. Store last forecast run
    so frontend no recompute on every hit (n grow over time, cache cheap).
    """
    created_at = models.DateTimeField(auto_now_add=True)
    horizon = models.IntegerField(default=14)
    history_json = models.JSONField()
    forecast_json = models.JSONField()
    moving_avg = models.FloatField()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Forecast@{self.created_at} h={self.horizon}"
