import{m as u,n as p,r as _,o as h,p as y,w as e,g as t,q as l,s as C,v as V,x as n,k as r,y as i,z as g,A as b,B as d,ay as k,t as w,l as m}from"./index.0bb0cce8.js";import{t as o}from"./form.21b59419.js";/* empty css              */import{V as x}from"./VForm.47dab060.js";const D={name:"DeleteCCUsers",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/cc_user/"+this.$route.query.id).then(a=>{o("Control center user successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>u.push("/cc-users")).catch(a=>{o("Error, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})}):o("Error deleting control center user, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){u.push("/cc-users")}},async mounted(){await this.$axios.get("/api/cc_user/"+this.$route.query.id).then(a=>{this.item=a.data}).catch(a=>{o("Error loading the page, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})})}};function v(a,B,$,E,f,c){const s=_("RouterLink");return h(),y(d,null,{default:e(()=>[t(l,{cols:"12",md:"12"},{default:e(()=>[t(C,null,{prepend:e(()=>[t(V,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(n,null,{default:e(()=>[t(s,{to:"/"},{default:e(()=>[r("Home")]),_:1})]),_:1}),t(i,null,{default:e(()=>[r(" / ")]),_:1}),t(n,null,{default:e(()=>[t(s,{to:"/cc-users"},{default:e(()=>[r(" Control Center Users ")]),_:1})]),_:1}),t(i,null,{default:e(()=>[r(" / ")]),_:1}),t(n,null,{default:e(()=>[t(s,{to:"/cc-users-delete?id"+a.$route.query.id},{default:e(()=>[r(" Delete User ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(l,{cols:"12"},{default:e(()=>[t(g,{title:"Delete a control center user"},{default:e(()=>[t(b,null,{default:e(()=>[t(d,null,{default:e(()=>[t(x,null,{default:e(()=>[t(k,null,{default:e(()=>[r(" You are about to delete a control center user with the username : "+w(f.item.username)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(l,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:c.remove},{default:e(()=>[r(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:e(()=>[r(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const z=p(D,[["render",v]]);export{z as default};
