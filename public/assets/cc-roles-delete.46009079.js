import{m as i,n as p,r as _,o as h,p as y,w as e,g as t,q as n,s as C,v as g,x as s,k as a,y as u,z as V,A as b,B as d,ay as k,t as w,l as m}from"./index.0bb0cce8.js";import{t as l}from"./form.21b59419.js";/* empty css              */import{V as x}from"./VForm.47dab060.js";const D={name:"DeleteCCRoles",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/cc_role/"+this.$route.query.id).then(o=>{l("Control center role successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>i.push("/cc-roles")).catch(o=>{l("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})}):l("Error deleting control center role, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){i.push("/cc-roles")}},async mounted(){await this.$axios.get("/api/cc_role/"+this.$route.query.id).then(o=>{this.item=o.data}).catch(o=>{l("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}};function v(o,B,R,$,f,c){const r=_("RouterLink");return h(),y(d,null,{default:e(()=>[t(n,{cols:"12",md:"12"},{default:e(()=>[t(C,null,{prepend:e(()=>[t(g,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(s,null,{default:e(()=>[t(r,{to:"/"},{default:e(()=>[a("Home")]),_:1})]),_:1}),t(u,null,{default:e(()=>[a(" / ")]),_:1}),t(s,null,{default:e(()=>[t(r,{to:"/cc-roles"},{default:e(()=>[a(" Control Center Roles ")]),_:1})]),_:1}),t(u,null,{default:e(()=>[a(" / ")]),_:1}),t(s,null,{default:e(()=>[t(r,{to:"/cc-roles-delete?id"+o.$route.query.id},{default:e(()=>[a(" Delete Role ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(n,{cols:"12"},{default:e(()=>[t(V,{title:"Delete a control center role"},{default:e(()=>[t(b,null,{default:e(()=>[t(d,null,{default:e(()=>[t(x,null,{default:e(()=>[t(k,null,{default:e(()=>[a(" You are about to delete the following role : "+w(f.item.name)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(n,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:c.remove},{default:e(()=>[a(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:e(()=>[a(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const A=p(D,[["render",v]]);export{A as default};
