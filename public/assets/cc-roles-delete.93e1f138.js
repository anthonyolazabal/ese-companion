import{n as i,p as _,r as p,o as h,q as y,w as e,i as t,s as n,v as C,x as g,y as s,l as a,z as u,A as V,B as b,C as d,ay as w,t as x,m}from"./index.3b184585.js";import{t as l}from"./form.3ba9d24b.js";/* empty css              */import{V as D}from"./VForm.20c01160.js";const k={name:"DeleteCCRoles",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/cc_role/"+this.$route.query.id).then(o=>{l("Control center role successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>i.push("/cc-roles")).catch(o=>{l("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})}):l("Error deleting control center role, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){i.push("/cc-roles")}},async mounted(){await this.$axios.get("/cc_role/"+this.$route.query.id).then(o=>{this.item=o.data}).catch(o=>{l("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}};function v(o,B,R,$,f,c){const r=p("RouterLink");return h(),y(d,null,{default:e(()=>[t(n,{cols:"12",md:"12"},{default:e(()=>[t(C,null,{prepend:e(()=>[t(g,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(s,null,{default:e(()=>[t(r,{to:"/"},{default:e(()=>[a("Home")]),_:1})]),_:1}),t(u,null,{default:e(()=>[a(" / ")]),_:1}),t(s,null,{default:e(()=>[t(r,{to:"/cc-roles"},{default:e(()=>[a(" Control Center Roles ")]),_:1})]),_:1}),t(u,null,{default:e(()=>[a(" / ")]),_:1}),t(s,null,{default:e(()=>[t(r,{to:"/cc-roles-delete?id"+o.$route.query.id},{default:e(()=>[a(" Delete Role ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(n,{cols:"12"},{default:e(()=>[t(V,{title:"Delete a control center role"},{default:e(()=>[t(b,null,{default:e(()=>[t(d,null,{default:e(()=>[t(D,null,{default:e(()=>[t(w,null,{default:e(()=>[a(" You are about to delete the following role : "+x(f.item.name)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(n,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(m,{color:"primary",variant:"tonal",onClick:c.remove},{default:e(()=>[a(" Delete ")]),_:1},8,["onClick"]),t(m,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:e(()=>[a(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const A=_(k,[["render",v]]);export{A as default};
