import{n as u,p,r as _,o as h,q as y,w as e,i as t,s as l,v as V,x as g,y as r,l as o,z as i,A as C,B as b,C as d,ay as q,t as x,m}from"./index.16be124a.js";import{t as n}from"./form.bdac96a9.js";/* empty css              */import{V as D}from"./VForm.40131a26.js";const k={name:"DeleteMQTTAccounts",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/user/"+this.$route.query.id).then(a=>{n("Account successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>u.push("/mqtt-accounts")).catch(a=>{n("Error removing accounts, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})}):n("Error deleting accounts, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){u.push("/mqtt-accounts")}},async mounted(){await this.$axios.get("/api/user/"+this.$route.query.id).then(a=>{this.item=a.data}).catch(a=>{n("Error loading the page, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})})}};function v(a,w,T,A,f,c){const s=_("RouterLink");return h(),y(d,null,{default:e(()=>[t(l,{cols:"12",md:"12"},{default:e(()=>[t(V,null,{prepend:e(()=>[t(g,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(r,null,{default:e(()=>[t(s,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(i,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(s,{to:"/mqtt-accounts"},{default:e(()=>[o(" MQTT Accounts ")]),_:1})]),_:1}),t(i,null,{default:e(()=>[o(" / ")]),_:1}),t(r,null,{default:e(()=>[t(s,{to:"/mqtt-accounts-delete?id"+a.$route.query.id},{default:e(()=>[o(" Delete Accounts ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(l,{cols:"12"},{default:e(()=>[t(C,{title:"Delete a MQTT accounts"},{default:e(()=>[t(b,null,{default:e(()=>[t(d,null,{default:e(()=>[t(D,null,{default:e(()=>[t(q,null,{default:e(()=>[o(" You are about to delete a the username : "+x(f.item.username)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(l,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:c.remove},{default:e(()=>[o(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:e(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const M=p(k,[["render",v]]);export{M as default};
