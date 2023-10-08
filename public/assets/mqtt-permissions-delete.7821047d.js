import{n as m,p as _,r as h,o as y,q as V,w as e,i as t,s as n,v as C,x as g,y as r,l as o,z as d,A as b,B as q,C as c,ay as w,t as p,m as f}from"./index.551e53aa.js";import{t as a}from"./form.50b7d74e.js";/* empty css              */import{V as x}from"./VForm.859299fb.js";const k={name:"DeleteMQTTPermissions",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/permission/"+this.$route.query.id).then(s=>{a("Permission successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>m.push("/mqtt-permissions")).catch(s=>{a(s.message,{type:"warning",position:"bottom-center"})}):a("Error deleting permission, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){m.push("/mqtt-permissions")}},async mounted(){await this.$axios.get("/api/permission/"+this.$route.query.id).then(s=>{this.item=s.data}).catch(s=>{a("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}};function D(s,T,v,B,l,u){const i=h("RouterLink");return y(),V(c,null,{default:e(()=>[t(n,{cols:"12",md:"12"},{default:e(()=>[t(C,null,{prepend:e(()=>[t(g,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(r,null,{default:e(()=>[t(i,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(i,{to:"/mqtt-permissions"},{default:e(()=>[o(" MQTT Permissions ")]),_:1})]),_:1}),t(d,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(i,{to:"/mqtt-permissions-delete?id"+s.$route.query.id},{default:e(()=>[o(" Delete Permission ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(n,{cols:"12"},{default:e(()=>[t(b,{title:"Delete a MQTT permission"},{default:e(()=>[t(q,null,{default:e(()=>[t(c,null,{default:e(()=>[t(x,null,{default:e(()=>[t(w,null,{default:e(()=>[o(" You are about to delete the permission : "+p(l.item.topic)+" (with id: "+p(l.item.id)+") in the ESE database. Are you sure ? ",1)]),_:1}),t(n,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(f,{color:"primary",variant:"tonal",onClick:u.remove},{default:e(()=>[o(" Delete ")]),_:1},8,["onClick"]),t(f,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:e(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const M=_(k,[["render",D]]);export{M as default};
