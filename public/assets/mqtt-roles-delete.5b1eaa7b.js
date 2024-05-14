import{m as u,n as p,r as _,o as h,p as y,w as e,g as t,q as s,s as g,v as V,x as n,k as o,y as d,z as C,A as b,B as c,ay as k,t as q,l as m}from"./index.89cdcb0e.js";import{t as l}from"./form.5851ad77.js";/* empty css              */import{V as w}from"./VForm.a8fa7f1a.js";const x={name:"DeleteMQTTRoles",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/role/"+this.$route.query.id).then(a=>{l("Role successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>u.push("/mqtt-roles")).catch(a=>{l("Error deleting the role, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})}):l("Error deleting role, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){u.push("/mqtt-roles")}},async mounted(){await this.$axios.get("/api/role/"+this.$route.query.id).then(a=>{this.item=a.data}).catch(a=>{l("Error loading the page, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})})}};function D(a,R,T,v,f,i){const r=_("RouterLink");return h(),y(c,null,{default:e(()=>[t(s,{cols:"12",md:"12"},{default:e(()=>[t(g,null,{prepend:e(()=>[t(V,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(n,null,{default:e(()=>[t(r,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(n,null,{default:e(()=>[t(r,{to:"/mqtt-roles"},{default:e(()=>[o(" MQTT Roles ")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(n,null,{default:e(()=>[t(r,{to:"/mqtt-roles-delete?id"+a.$route.query.id},{default:e(()=>[o(" Delete Role ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(s,{cols:"12"},{default:e(()=>[t(C,{title:"Delete a MQTT role"},{default:e(()=>[t(b,null,{default:e(()=>[t(c,null,{default:e(()=>[t(w,null,{default:e(()=>[t(k,null,{default:e(()=>[o(" You are about to delete the following role : "+q(f.item.name)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(s,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:i.remove},{default:e(()=>[o(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:i.cancel},{default:e(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const M=p(x,[["render",D]]);export{M as default};