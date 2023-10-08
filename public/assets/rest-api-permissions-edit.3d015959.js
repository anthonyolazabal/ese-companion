import{n as c,p as g,r as h,o as y,q as x,w as s,i as e,s as o,v as b,x as C,y as p,l as i,z as f,A as k,B as w,C as m,m as _}from"./index.551e53aa.js";import{t as r}from"./form.50b7d74e.js";/* empty css              */import{V as B}from"./VForm.859299fb.js";import{V}from"./VTextField.5d7f987a.js";const P={name:"EditRestApiPermissions",data(){return{item:{}}},methods:{async submit(){this.item.permission_string?await this.$axios.put("/api/rest_api_permission/"+this.$route.query.id,this.item).then(t=>{r("Rest Api permission updated successfully",{type:"success",position:"bottom-center"})}).then(()=>c.push("/rest-api-permissions")).catch(t=>{r(t.message,{type:"warning",position:"bottom-center"})}):r("Please fill all fields ! ",{type:"warning",position:"bottom-center"})},cancel(){c.push("/rest-api-permissions")}},async mounted(){await this.$axios.get("/api/rest_api_permission/"+this.$route.query.id).then(t=>{this.item=t.data}).catch(t=>{r("Error loading the page, contact your admin ! Details : "+t.message,{type:"warning",position:"bottom-center"})})}};function R(t,a,A,q,l,u){const n=h("RouterLink");return y(),x(m,null,{default:s(()=>[e(o,{cols:"12",md:"12"},{default:s(()=>[e(b,null,{prepend:s(()=>[e(C,{size:"small",icon:"mdi-home"})]),default:s(()=>[e(p,null,{default:s(()=>[e(n,{to:"/"},{default:s(()=>[i("Home")]),_:1})]),_:1}),e(f,null,{default:s(()=>[i(" / ")]),_:1}),e(p,null,{default:s(()=>[e(n,{to:"/rest-api-permissions"},{default:s(()=>[i(" Rest Api Permissions ")]),_:1})]),_:1}),e(f,null,{default:s(()=>[i(" / ")]),_:1}),e(p,null,{default:s(()=>[e(n,{to:"/rest-api-permissions-edit?id"+t.$route.query.id},{default:s(()=>[i(" Edit Permission ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(o,{cols:"12"},{default:s(()=>[e(k,{title:"Update a rest api permission"},{default:s(()=>[e(w,null,{default:s(()=>[e(B,null,{default:s(()=>[e(m,{style:{"margin-top":"2px"}},{default:s(()=>[e(o,{cols:"12",md:"12",class:"d-flex gap-4"},{default:s(()=>[e(V,{modelValue:l.item.permission_string,"onUpdate:modelValue":a[0]||(a[0]=d=>l.item.permission_string=d),label:"Permission",placeholder:"permission_string"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"12",class:"d-flex gap-4"},{default:s(()=>[e(V,{modelValue:l.item.description,"onUpdate:modelValue":a[1]||(a[1]=d=>l.item.description=d),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1})]),_:1}),e(m,{style:{"margin-top":"2px"}},{default:s(()=>[e(o,{cols:"12",class:"d-flex gap-4"}),e(o,{cols:"12",class:"d-flex gap-4"},{default:s(()=>[e(_,{color:"primary",onClick:u.submit},{default:s(()=>[i(" Update ")]),_:1},8,["onClick"]),e(_,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:s(()=>[i(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const $=g(P,[["render",R]]);export{$ as default};
