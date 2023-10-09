import{m as c,n as V,r as x,o as h,p as C,w as s,g as e,q as i,s as b,v as y,x as d,k as t,y as f,z as k,A,B as m,l as _}from"./index.998ab70e.js";import{t as p}from"./form.77a082ea.js";/* empty css              */import{V as w}from"./VForm.c9077497.js";import{V as g}from"./VTextField.16466e2b.js";const B={name:"AddRestApiPermissions",data(){return{item:{permission_string:"",description:""},loading:!1}},methods:{async submit(){this.loading=!0,this.item.permission_string?await this.$axios.post("/api/rest_api_permission",this.item).then(a=>{p("Rest Api permission created successfully",{type:"success",position:"bottom-center"})}).then(()=>c.push("/rest-api-permissions")).catch(a=>{p("Error on submit, contact your admin ! Details : "+a.message,{type:"warning",position:"bottom-center"}),this.loading=!1}):(p("Please fill all fields ! ",{type:"warning",position:"bottom-center"}),this.loading=!1)},cancel(){c.push("/rest-api-permissions")}}};function P(a,o,R,v,l,u){const n=x("RouterLink");return h(),C(m,null,{default:s(()=>[e(i,{cols:"12",md:"12"},{default:s(()=>[e(b,null,{prepend:s(()=>[e(y,{size:"small",icon:"mdi-home"})]),default:s(()=>[e(d,null,{default:s(()=>[e(n,{to:"/"},{default:s(()=>[t("Home")]),_:1})]),_:1}),e(f,null,{default:s(()=>[t(" / ")]),_:1}),e(d,null,{default:s(()=>[e(n,{to:"/rest-api-permissions"},{default:s(()=>[t(" Rest Api Permissions ")]),_:1})]),_:1}),e(f,null,{default:s(()=>[t(" / ")]),_:1}),e(d,null,{default:s(()=>[e(n,{to:"/rest-api-permissions-add"},{default:s(()=>[t(" Add Permission ")]),_:1})]),_:1})]),_:1})]),_:1}),e(i,{cols:"12"},{default:s(()=>[e(k,{title:"Create a new rest api permission"},{default:s(()=>[e(A,null,{default:s(()=>[e(w,null,{default:s(()=>[e(m,{style:{"margin-top":"2px"}},{default:s(()=>[e(i,{cols:"12",md:"12",class:"d-flex gap-4"},{default:s(()=>[e(g,{modelValue:l.item.permission_string,"onUpdate:modelValue":o[0]||(o[0]=r=>l.item.permission_string=r),label:"Permission",placeholder:"permission_string"},null,8,["modelValue"])]),_:1}),e(i,{cols:"12",md:"12",class:"d-flex gap-4"},{default:s(()=>[e(g,{modelValue:l.item.description,"onUpdate:modelValue":o[1]||(o[1]=r=>l.item.description=r),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1})]),_:1}),e(m,{style:{"margin-top":"2px"}},{default:s(()=>[e(i,{cols:"12",class:"d-flex gap-4"}),e(i,{cols:"12",class:"d-flex gap-4"},{default:s(()=>[e(_,{color:"primary",onClick:u.submit,loading:l.loading},{default:s(()=>[t(" Create ")]),_:1},8,["onClick","loading"]),e(_,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:s(()=>[t(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const N=V(B,[["render",P]]);export{N as default};
