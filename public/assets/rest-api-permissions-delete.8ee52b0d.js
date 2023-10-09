import{m as u,n as _,r as f,o as h,p as y,w as e,g as t,q as r,s as V,v as g,x as n,k as s,y as d,z as C,A as b,B as m,ay as k,t as x,l as c}from"./index.998ab70e.js";import{t as i}from"./form.77a082ea.js";/* empty css              */import{V as w}from"./VForm.c9077497.js";const A={name:"DeleteRestApiPermissions",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/rest_api_permission/"+this.$route.query.id).then(()=>{i("Rest Api permission successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>u.push("/rest-api-permissions")).catch(a=>{i(a.message,{type:"warning",position:"bottom-center"})}):i("Error deleting Rest Api permission, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){u.push("/rest-api-permissions")}},async mounted(){await this.$axios.get("/api/rest_api_permission/"+this.$route.query.id).then(a=>{this.item=a.data}).catch(a=>{i("Error loading the page, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"})})}};function D(a,R,v,B,p,l){const o=f("RouterLink");return h(),y(m,null,{default:e(()=>[t(r,{cols:"12",md:"12"},{default:e(()=>[t(V,null,{prepend:e(()=>[t(g,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(n,null,{default:e(()=>[t(o,{to:"/"},{default:e(()=>[s("Home")]),_:1})]),_:1}),t(d,null,{default:e(()=>[s(" / ")]),_:1}),t(n,null,{default:e(()=>[t(o,{to:"/rest-api-permissions"},{default:e(()=>[s(" Rest Api Permissions ")]),_:1})]),_:1}),t(d,null,{default:e(()=>[s(" / ")]),_:1}),t(n,null,{default:e(()=>[t(o,{to:"/rest-api-permissions-delete?id"+a.$route.query.id},{default:e(()=>[s(" Delete Permission ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(r,{cols:"12"},{default:e(()=>[t(C,{title:"Delete a Rest Api permission"},{default:e(()=>[t(b,null,{default:e(()=>[t(m,null,{default:e(()=>[t(w,null,{default:e(()=>[t(k,null,{default:e(()=>[s(" You are about to delete the permission : "+x(p.item.permission_string)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(r,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(c,{color:"primary",variant:"tonal",onClick:l.remove},{default:e(()=>[s(" Delete ")]),_:1},8,["onClick"]),t(c,{color:"secondary",variant:"tonal",onClick:l.cancel},{default:e(()=>[s(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const I=_(A,[["render",D]]);export{I as default};