import{m as c,n as _,r as f,o as h,p as y,w as e,g as t,q as r,s as C,v as V,x as i,k as o,y as u,z as g,A as b,B as d,ay as k,t as x,l as m}from"./index.40a940c5.js";import{t as a}from"./form.35e1d7cc.js";/* empty css              */import{V as w}from"./VForm.a6d981bf.js";const D={name:"DeleteCCPermissions",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/cc_permission/"+this.$route.query.id).then(s=>{a("Control center permission successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>c.push("/cc-permissions")).catch(s=>{a(s.message,{type:"warning",position:"bottom-center"})}):a("Error deleting control center permission, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){c.push("/cc-permissions")}},async mounted(){await this.$axios.get("/api/cc_permission/"+this.$route.query.id).then(s=>{this.item=s.data}).catch(s=>{a("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}};function v(s,B,$,q,p,l){const n=f("RouterLink");return h(),y(d,null,{default:e(()=>[t(r,{cols:"12",md:"12"},{default:e(()=>[t(C,null,{prepend:e(()=>[t(V,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(i,null,{default:e(()=>[t(n,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(u,null,{default:e(()=>[o(" / ")]),_:1}),t(i,null,{default:e(()=>[t(n,{to:"/cc-permissions"},{default:e(()=>[o(" Control Center Permissions ")]),_:1})]),_:1}),t(u,null,{default:e(()=>[o(" / ")]),_:1}),t(i,null,{default:e(()=>[t(n,{to:"/cc-permissions-delete?id"+s.$route.query.id},{default:e(()=>[o(" Delete Permission ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(r,{cols:"12"},{default:e(()=>[t(g,{title:"Delete a control center permission"},{default:e(()=>[t(b,null,{default:e(()=>[t(d,null,{default:e(()=>[t(w,null,{default:e(()=>[t(k,null,{default:e(()=>[o(" You are about to delete the permission : "+x(p.item.permission_string)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(r,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:l.remove},{default:e(()=>[o(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:l.cancel},{default:e(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const z=_(D,[["render",v]]);export{z as default};
