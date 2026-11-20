// API connection is opt-in during development.
// Never put a Neon connection string or API secret in EXPO_PUBLIC_ variables.
// Android emulator: http://10.0.2.2:4000 (requires API to bind to an accessible interface).
// Physical device: use a secure HTTPS backend, not a public unauthenticated API.
const base = process.env.EXPO_PUBLIC_AILO_API_URL?.replace(/\/$/, '');
export const apiEnabled = Boolean(base);
async function request(path,options={}) {
  if(!base) throw new Error('API URL not configured');
  const response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  if(!response.ok) throw new Error('API request failed ('+response.status+')');
  return response.status===204?null:response.json();
}
export const occasionApi={
  list:async()=> (await request('/api/occasions')).occasions,
  create:(occasion)=>request('/api/occasions',{method:'POST',body:JSON.stringify(occasion)}),
  remove:(id)=>request('/api/occasions/'+encodeURIComponent(id),{method:'DELETE'})
};
