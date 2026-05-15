import axios from "axios";
import { TMDB_CONFIG } from "../config/tmdb";


export const tmdbClient = axios.create({
    baseURL: TMDB_CONFIG.baseUrl,
    headers: {
        Authorization: `Bearer ${TMDB_CONFIG.accessToken}`,
        Accept: "application/json",
    },
    params:{
        language: "ru-RU",
    },
})