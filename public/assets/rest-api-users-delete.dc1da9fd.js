import{m as i,n as _,r as f,o as h,p as y,w as e,g as t,q as l,s as V,v as C,x as o,k as a,y as c,z as g,A as k,B as d,ay as x,t as b,l as p}from"./index.0bb0cce8.js";import{t as n}from"./form.21b59419.js";/* empty css              */import{V as w}from"./VForm.47dab060.js";const v={name:"DeleteRestApiUsers",data(){return{item:{}}},methods:{async remove(){this.item!=null?await this.$axios.delete("/api/rest_api_user/"+this.$route.query.id).then(()=>{n("Rest Api user successfully deleted",{type:"success",position:"bottom-center"})}).then(()=>i.push("/rest-api-users")).catch(s=>{n(s.message,{type:"warning",position:"bottom-center"})}):n("Error deleting control panel user, contact your admin ! ",{type:"warning",position:"bottom-center"})},cancel(){i.push("/rest-api-users")}},async mounted(){await this.$axios.get("/api/rest_api_user/"+this.$route.query.id).then(s=>{this.item=s.data}).catch(s=>{console.log(s)})}};function B(s,D,A,R,m,u){const r=f("RouterLink");return h(),y(d,null,{default:e(()=>[t(l,{cols:"12",md:"12"},{default:e(()=>[t(V,null,{prepend:e(()=>[t(C,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(o,null,{default:e(()=>[t(r,{to:"/"},{default:e(()=>[a("Home")]),_:1})]),_:1}),t(c,null,{default:e(()=>[a(" / ")]),_:1}),t(o,null,{default:e(()=>[t(r,{to:"/rest-api-users"},{default:e(()=>[a(" Rest Api Users ")]),_:1})]),_:1}),t(c,null,{default:e(()=>[a(" / ")]),_:1}),t(o,null,{default:e(()=>[t(r,{to:"/rest-api-users-delete?id"+s.$route.query.id},{default:e(()=>[a(" Delete User ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(l,{cols:"12"},{default:e(()=>[t(g,{title:"Delete a rest api user"},{default:e(()=>[t(k,null,{default:e(()=>[t(d,null,{default:e(()=>[t(w,null,{default:e(()=>[t(x,null,{default:e(()=>[a(" You are about to delete a rest api user with the username : "+b(m.item.username)+" in the ESE database. Are you sure ? ",1)]),_:1}),t(l,{cols:"12",class:"d-flex gap-4"},{default:e(()=>[t(p,{color:"primary",variant:"tonal",onClick:u.remove},{default:e(()=>[a(" Delete ")]),_:1},8,["onClick"]),t(p,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:e(()=>[a(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const I=_(v,[["render",B]]);export{I as default};
