import axios from 'axios';

import CONSTANTS from '../../../server/constants';

const API = CONSTANTS.API_ACTIVITIES;
const CONFIG_API = CONSTANTS.API_CONFIG;

export const getActivities = () => axios.get(API);
export const createActivity = (data) => axios.post(API, data);
export const updateActivity = (id, data) => axios.patch(`${API}/${id}`, data);

export const getConfig = () => axios.get(CONFIG_API);
export const updateConfig = (data) => axios.post(CONFIG_API, data);
export const openExcelFile = () => axios.post(`${CONFIG_API}/open`);

export const reportByWeek = (data) => axios.post(`${API}/report/week`, data);
export const reportByAccount = (data) => axios.post(`${API}/report/account`, data);
