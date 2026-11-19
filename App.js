import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const C = { bg:'#F8F5F0', lavender:'#DCD2FA', peach:'#FFCDBB', ink:'#29243B', muted:'#817B8B' };
const KEY = 'ailo:occasions:v1';
const validTime = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
function occurrence(item) {
  const now = new Date();
  for(let year=now.getFullYear();year<=now.getFullYear()+8;year++){
    const date=new Date(year,item.month-1,item.day);
    if(date.getMonth()!==item.month-1 || date.getDate()!==item.day || date.getTime()+86400000<=now.getTime())continue;
    const first=new Date(date.getTime()-600000);
    const second=new Date(date);
    if(item.custom){
      const [h,m]=item.first.split(':').map(Number);
      first.setDate(first.getDate()-1);first.setHours(h,m,0,0);
      if(item.secondEnabled){const [h2,m2]=item.second.split(':').map(Number);second.setHours(h2,m2,0,0);}
    }
    return {date,calls:item.secondEnabled===false?[first]:[first,second]};
  }
  return null;
}
function Button({title,onPress}) {return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={s.button}><Text style={s.buttonText}>{title}</Text></TouchableOpacity>}
export default function App(){
  const [items,setItems]=useState([]),[ready,setReady]=useState(false),[form,setForm]=useState(false);
  const [name,setName]=useState(''),[kind,setKind]=useState('Birthday'),[day,setDay]=useState('6'),[month,setMonth]=useState('6');
  const [custom,setCustom]=useState(false),[first,setFirst]=useState('23:50'),[second,setSecond]=useState('00:00'),[secondEnabled,setSecondEnabled]=useState(true);
  useEffect(()=>{AsyncStorage.getItem(KEY).then(v=>{if(v)setItems(JSON.parse(v))}).catch(()=>Alert.alert('Storage error','Unable to load occasions')).finally(()=>setReady(true))},[]);
  useEffect(()=>{if(ready)AsyncStorage.setItem(KEY,JSON.stringify(items)).catch(()=>Alert.alert('Storage error','Unable to save occasions'))},[items,ready]);
  function save(){
    const d=Number(day),m=Number(month);
    const date=new Date(2024,m-1,d);
    if(!name.trim()||!Number.isInteger(d)||!Number.isInteger(m)||date.getMonth()!==m-1||date.getDate()!==d||d<1||m<1||m>12){
      Alert.alert('Check details','Enter a name and a valid day/month.');return;
    }
    if(custom&&(!validTime(first)||(secondEnabled&&!validTime(second)))){Alert.alert('Invalid time','Enter time as HH:MM (24-hour).');return}
    setItems(p=>[...p,{id:String(Date.now())+Math.random(),name:name.trim(),kind,day:d,month:m,custom,first,second,secondEnabled}]);
    setName('');setForm(false);
  }
  const upcoming=items.map(item=>({...item,next:occurrence(item)})).filter(x=>x.next).sort((a,b)=>a.next.date-b.next.date);
  const pretty=d=>d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={C.bg}/><ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <View style={s.header}><View><Text style={s.eyebrow}>YOUR THOUGHTFUL COMPANION</Text><Text style={s.logo}>ailo<Text style={{color:'#BDA6F1'}}>✦</Text></Text></View><Text style={s.avatar}>✿</Text></View>
    <View style={s.hero}><Text style={s.eyebrow}>A LITTLE VOICE THAT REMEMBERS</Text><Text style={s.heroTitle}>Make every moment count.</Text><Text style={s.body}>Birthdays, anniversaries, and the people you love — all in one place.</Text><Button title="＋  Add an occasion" onPress={()=>setForm(!form)}/></View>
    {form&&<View style={s.card}><Text style={s.heading}>New occasion</Text><Text style={s.label}>Person or occasion</Text><TextInput style={s.input} placeholder="e.g. Aman's birthday" value={name} onChangeText={setName}/><Text style={s.label}>Occasion type</Text><View style={s.row}>{['Birthday','Anniversary','Other'].map(v=><TouchableOpacity key={v} onPress={()=>setKind(v)} style={[s.chip,kind===v&&{backgroundColor:C.lavender}]}><Text style={s.chipText}>{v}</Text></TouchableOpacity>)}</View><View style={s.row}><View style={{flex:1}}><Text style={s.label}>Day</Text><TextInput style={s.input} keyboardType="number-pad" value={day} onChangeText={setDay}/></View><View style={{flex:1}}><Text style={s.label}>Month</Text><TextInput style={s.input} keyboardType="number-pad" value={month} onChangeText={setMonth}/></View></View><View style={s.switchRow}><Text style={s.label}>Custom call schedule</Text><Switch value={custom} onValueChange={setCustom}/></View>{custom&&<><Text style={s.label}>First call (previous day, HH:MM)</Text><TextInput style={s.input} value={first} onChangeText={setFirst}/><View style={s.switchRow}><Text style={s.label}>Second call</Text><Switch value={secondEnabled} onValueChange={setSecondEnabled}/></View>{secondEnabled&&<><Text style={s.label}>Second call (occasion day, HH:MM)</Text><TextInput style={s.input} value={second} onChangeText={setSecond}/></>}</>}<Button title="Save occasion" onPress={save}/><Text style={s.note}>Stored on this device. Real phone calls are not enabled yet.</Text></View>}
    <View style={s.section}><Text style={s.heading}>Upcoming moments</Text><Text style={s.muted}>{upcoming.length} saved</Text></View>
    {upcoming.length===0?<View style={s.card}><Text style={{fontSize:30}}>🎂</Text><Text style={s.heading}>Your moments start here</Text><Text style={s.muted}>Add a birthday or anniversary to preview call times.</Text></View>:upcoming.map(item=><View key={item.id} style={s.card}><View style={s.row}><Text style={s.eventIcon}>{item.kind==='Birthday'?'🎂':item.kind==='Anniversary'?'💗':'✨'}</Text><View style={{flex:1}}><Text style={s.eventName}>{item.name}</Text><Text style={s.muted}>{item.kind} · {item.next.date.toLocaleDateString(undefined,{month:'long',day:'numeric'})}</Text></View><TouchableOpacity onPress={()=>Alert.alert('Remove occasion',`Delete ${item.name}?`,[{text:'Cancel'},{text:'Delete',style:'destructive',onPress:()=>setItems(p=>p.filter(x=>x.id!==item.id))}])}><Text style={{color:'#B56A77'}}>Remove</Text></TouchableOpacity></View><View style={s.divider}/>{item.next.calls.map((d,i)=><Text key={i} style={s.call}>📞  Call {i+1}: {pretty(d)}</Text>)}</View>)}
    <View style={s.tip}><Text style={s.heading}>✨ The Ailo promise</Text><Text style={s.muted}>Default call previews: 11:50 PM the previous day and 12:00 AM on the occasion. AI calls and reliable scheduling will be added later.</Text></View>
  </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},page:{padding:22,paddingBottom:60},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:22},eyebrow:{fontSize:10,letterSpacing:1.5,color:'#665A80',fontWeight:'800'},logo:{fontSize:40,fontWeight:'900',color:C.ink},avatar:{fontSize:25,backgroundColor:C.peach,overflow:'hidden',padding:14,borderRadius:20},hero:{backgroundColor:C.lavender,borderRadius:32,padding:24,borderWidth:2,borderColor:'#EFE8FF',elevation:7,marginBottom:24},heroTitle:{fontSize:34,lineHeight:39,fontWeight:'900',color:C.ink,marginVertical:13},body:{fontSize:14,color:'#625878',lineHeight:21,marginBottom:20},button:{backgroundColor:C.peach,borderRadius:20,padding:17,alignItems:'center',borderWidth:2,borderColor:'#FFE8DE',elevation:4,marginTop:12},buttonText:{fontSize:15,fontWeight:'800',color:C.ink},card:{backgroundColor:'#FFFDFC',borderRadius:26,padding:19,marginBottom:15,borderWidth:2,borderColor:'#FFFFFF',elevation:3},heading:{fontSize:21,fontWeight:'900',color:C.ink,marginBottom:9},label:{fontSize:12,fontWeight:'800',color:C.ink,marginTop:15,marginBottom:7},input:{borderRadius:15,backgroundColor:'#F5F0F9',borderColor:'#E7DEF2',borderWidth:1,padding:13,fontSize:16,color:C.ink},row:{flexDirection:'row',alignItems:'center',gap:10},chip:{paddingHorizontal:12,paddingVertical:11,backgroundColor:'#F5F0F9',borderRadius:14,marginTop:4},chipText:{fontSize:12,fontWeight:'700',color:C.ink},switchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10},note:{color:C.muted,fontSize:11,textAlign:'center',marginTop:12},section:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:12},muted:{fontSize:13,color:C.muted,lineHeight:20},eventIcon:{fontSize:24,backgroundColor:'#F4E8FF',padding:12,borderRadius:18},eventName:{fontSize:17,fontWeight:'900',color:C.ink},divider:{height:1,backgroundColor:'#EFEAF3',marginVertical:14},call:{fontSize:13,color:C.ink,marginBottom:8,fontWeight:'600'},tip:{backgroundColor:'#EFE9FA',padding:19,borderRadius:22,marginTop:10}});
