import{m,n as _,r as h,o as y,p as V,w as e,g as t,q as n,s as g,v as C,x as r,k as o,y as d,z as b,A as k,B as c,ay as q,t as p,l as f}from"./index.40a940c5.js";import{t as a}from"./form.35e1d7cc.js";/* empty css              */import{V as w}from"./VForm.a6d981bf.js";const x={name:"DeleteMQTTPermissions",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/permission/"+this.$route.query.id).then(s=>{a("Permission successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>m.push("/mqtt-permissions")).catch(s=>{a(s.message,{type:"warning",position:"bottom-center"})}):a("Error deleting permission, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){m.push("/mqtt-permissions")}},async mounted(){await this.$axios.get("/api/permission/"+this.$route.query.id).then(s=>{this.item=s.data}).catch(s=>{a("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}};function D(s,T,v,B,l,u){const i=h("RouterLink");return y(),V(c,null,{default:e(()=>[t(n,{cols:"12",md:"12"},{default:e(()=>[t(g,null,{prepend:e(()=>[t(C,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(r,null,{default:e(()=>[t(i,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(i,{to:"/mqtt-permissions"},{default:e(()=>[o(" MQTT Permissions ")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(i,{to:"/mqtt-permissions-delete?id"+s.$route.query.id},{default:e(()=>[o(" Delete Permission ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(n,{cols:"12"},{default:e(()=>[t(b,{title:"Delete a MQTT permission"},{default:e(()=>[t(k,null,{default:e(()=>[t(c,null,{default:e(()=>[t(w,null,{default:e(()=>[t(q,null,{default:e(()=>[o(" You are about to delete the permission : "+p(l.item.topic)+" (with id: "+p(l.item.id)+") in the ESE database. Are you sure ? ",1)]),_:1}),t(n,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(f,{color:"primary",variant:"tonal",onClick:u.remove},{default:e(()=>[o(" Delete ")]),_:1},8,["onClick"]),t(f,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:e(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const M=_(x,[["render",D]]);export{M as default};
