import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',workers:1,timeout:30000,use:{baseURL:'http://127.0.0.1:1420',headless:true,screenshot:'only-on-failure'},webServer:{command:'pnpm dev',url:'http://127.0.0.1:1420',reuseExistingServer:!process.env.CI},reporter:[['list'],['html',{open:'never'}]]});
