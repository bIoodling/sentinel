import {test,expect} from '@playwright/test';
const pages=['Dashboard','Discovery','Portfolio','Social intelligence','AI assistant','Notifications','Connections','Settings'];
for(const viewport of [{width:1440,height:920},{width:1024,height:768},{width:768,height:1024},{width:720,height:620}]){
 test(`all pages fit ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
  for(const name of pages){
   await page.getByRole('navigation',{name:'Main navigation'}).locator('button').count();
   await page.locator('.sidebar').getByRole('button',{name,exact:true}).click();
   await expect(page.locator('main')).toHaveAttribute('data-page',name);
   await expect(page.getByRole('heading',{level:1})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight)).toBe(true);
   expect(await page.locator('main').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
   await page.screenshot({path:`screenshots/${viewport.width}-${viewport.height}/${name.replaceAll(' ','-')}.png`});
  }
  expect(errors).toEqual([]);
 });
}
test('practice trade, preferences, keywords and demo chat survive workflows',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.getByRole('button',{name:'Inspect ORBIT',exact:true}).click();
 await page.getByRole('button',{name:'Review buy',exact:true}).click();
 await page.getByRole('button',{name:'Confirm practice transaction',exact:true}).click();
 await page.locator('.sidebar').getByRole('button',{name:'Portfolio',exact:true}).click();await expect(page.getByRole('button',{name:'Manage',exact:true})).toBeVisible();
 await page.locator('.sidebar').getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('slider',{name:'Font size',exact:true}).fill('16');await page.waitForTimeout(350);await page.reload();await expect(page.getByRole('slider',{name:'Font size',exact:true})).toHaveValue('16');
 await page.locator('.sidebar').getByRole('button',{name:'Social intelligence',exact:true}).click();await page.getByRole('button',{name:/Keywords ·/}).click();expect(await page.locator('.keyword-item').count()).toBeGreaterThanOrEqual(50);
 await page.getByRole('textbox',{name:'Monitoring keyword',exact:true}).fill('Research fixture');await page.getByRole('button',{name:'Add keyword',exact:true}).click();await expect(page.getByText('Research fixture',{exact:true})).toBeVisible();
 await page.locator('.sidebar').getByRole('button',{name:'AI assistant',exact:true}).click();await page.getByRole('button',{name:'Analyse a token',exact:true}).click();await expect(page.locator('.message.assistant')).toContainText('SCRIPTED DEMO',{timeout:15000});
 await page.locator('.sidebar').getByRole('button',{name:'Notifications',exact:true}).click();await page.getByRole('button',{name:'Test alert',exact:true}).click();await expect(page.locator('.in-app-alert')).toBeVisible();
});
