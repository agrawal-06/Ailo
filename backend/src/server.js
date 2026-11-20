import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { sql } from './db.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'16kb'}));
app.use(cors({origin:false})); // Mobile clients do not require browser CORS.
const fail = (res,code,message) => res.status(code).json({error:message});
const isTime = value => typeof value==='string' && /^([01]\\d|2[0-3]):[0-5]\\d$/.test(value);
const validDate = (day,month) => Number.isInteger(day) && Number.isInteger(month) &&
  month>=1 && month<=12 && day>=1 && new Date(2024,month-1,day).getMonth()===month-1 &&
  new Date(2024,month-1,day).getDate()===day;
function parse(body){
 const {name,kind,day,month}=body||{};
 const custom=body?.custom===true;
 const first=custom?body?.first:'23:50';
 const second=custom?body?.second:'00:00';
 const secondEnabled=body?.secondEnabled!==false;
 if(typeof name!=='string'||!name.trim()||name.trim().length>120||
 !['Birthday','Anniversary','Other'].includes(kind)||!validDate(day,month)||
 !isTime(first)||(secondEnabled&&!isTime(second)))return null;
 return {name:name.trim(),kind,day,month,custom,first,second:secondEnabled?second:'00:00',secondEnabled};
}
const select = `SELECT id,name,kind,day,month,custom,
to_char(first_call,'HH24:MI') AS first,
to_char(second_call,'HH24:MI') AS second,
second_enabled AS "secondEnabled",created_at AS "createdAt" FROM occasions`;
app.get('/health',async (_req,res)=>{try{await sql`SELECT 1`;res.json({ok:true,db:'connected'});}catch(e){console.error(e);fail(res,503,'Database unavailable');}});
app.get('/api/occasions',async (_req,res)=>{try{
 const rows=await sql`SELECT id,name,kind,day,month,custom,
 to_char(first_call,'HH24:MI') AS first,to_char(second_call,'HH24:MI') AS second,
 second_enabled AS "secondEnabled",created_at AS "createdAt" FROM occasions ORDER BY month,day,name`;
 res.json({occasions:rows});
}catch(e){console.error(e);fail(res,500,'Unable to load occasions');}});
app.post('/api/occasions',async (req,res)=>{
 const o=parse(req.body);if(!o)return fail(res,400,'Invalid occasion details');
 try{const id=randomUUID();const rows=await sql`
 INSERT INTO occasions(id,name,kind,day,month,custom,first_call,second_call,second_enabled)
 VALUES(${id},${o.name},${o.kind},${o.day},${o.month},${o.custom},${o.first},${o.second},${o.secondEnabled})
 RETURNING id`;res.status(201).json({id:rows[0].id,...o});}
 catch(e){console.error(e);fail(res,500,'Unable to create occasion');}
});
app.delete('/api/occasions/:id',async(req,res)=>{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id))return fail(res,400,'Invalid ID');
 try{const rows=await sql`DELETE FROM occasions WHERE id=${req.params.id} RETURNING id`;
 if(!rows.length)return fail(res,404,'Occasion not found');res.status(204).end();}
 catch(e){console.error(e);fail(res,500,'Unable to delete occasion');}
});
app.use((err,_req,res,_next)=>{console.error(err);fail(res,400,'Invalid request');});
const port=Number(process.env.PORT||4000);
app.listen(port,'127.0.0.1',()=>console.log(`Ailo API listening on http://127.0.0.1:${port}`));
