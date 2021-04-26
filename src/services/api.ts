import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.bashAPI_URL|| 'http://localhost:3333/'
})

