import api from './axios';

export const getNodes       = ()        => api.get('/hostel/nodes/');
export const createNode     = (data)    => api.post('/hostel/nodes/', data);
export const updateNode     = (id, d)   => api.put(`/hostel/nodes/${id}/`, d);
export const deleteNode     = (id)      => api.delete(`/hostel/nodes/${id}/`);

export const getEdges       = ()        => api.get('/hostel/edges/');
export const createEdge     = (data)    => api.post('/hostel/edges/', data);
export const updateEdge     = (id, d)   => api.put(`/hostel/edges/${id}/`, d);
export const deleteEdge     = (id)      => api.delete(`/hostel/edges/${id}/`);

export const getNodesPublic = ()        => api.get('/hostel/nodes-public/');
export const findPath       = (f, t)    => api.get('/hostel/navigate/', { params: { from: f, to: t } });