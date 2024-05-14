import{m as c,n as g,r as h,o as C,p as b,w as l,g as e,q as o,s as x,v as y,x as d,k as t,y as p,z as R,A as k,B as f,l as _}from"./index.89cdcb0e.js";import{t as u}from"./form.5851ad77.js";/* empty css              */import{V as A}from"./VForm.a8fa7f1a.js";import{V}from"./VTextField.ade5f7c9.js";const w={name:"AddRestApiRoles",data(){return{item:{},loading:!1}},methods:{async submit(){this.loading=!0,this.item.name?await this.$axios.post("/api/rest_api_role",this.item).then(s=>{u("Rest Api role created successfully",{type:"success",position:"bottom-center"}),c.push("/rest-api-roles-details?id="+s.data.id)}).catch(s=>{u("Error on submit, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"}),this.loading=!1}):(u("Please fill all fields ! ",{type:"warning",position:"bottom-center"}),this.loading=!1)},cancel(){c.push("/rest-api-roles")}}};function B(s,i,v,D,a,m){const r=h("RouterLink");return C(),b(f,null,{default:l(()=>[e(o,{cols:"12",md:"12"},{default:l(()=>[e(x,null,{prepend:l(()=>[e(y,{size:"small",icon:"mdi-home"})]),default:l(()=>[e(d,null,{default:l(()=>[e(r,{to:"/"},{default:l(()=>[t("Home")]),_:1})]),_:1}),e(p,null,{default:l(()=>[t(" / ")]),_:1}),e(d,null,{default:l(()=>[e(r,{to:"/rest-api-roles"},{default:l(()=>[t(" Rest Api Roles ")]),_:1})]),_:1}),e(p,null,{default:l(()=>[t(" / ")]),_:1}),e(d,null,{default:l(()=>[e(r,{to:"/rest-api-roles-add"},{default:l(()=>[t(" Add Role ")]),_:1})]),_:1})]),_:1})]),_:1}),e(o,{cols:"12"},{default:l(()=>[e(R,{title:"Create a new rest api role"},{default:l(()=>[e(k,null,{default:l(()=>[e(A,null,{default:l(()=>[e(f,{style:{"margin-top":"2px"}},{default:l(()=>[e(o,{cols:"12",md:"6",class:"d-flex gap-4"},{default:l(()=>[e(V,{modelValue:a.item.name,"onUpdate:modelValue":i[0]||(i[0]=n=>a.item.name=n),label:"Name",placeholder:"name"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:l(()=>[e(V,{modelValue:a.item.description,"onUpdate:modelValue":i[1]||(i[1]=n=>a.item.description=n),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",class:"d-flex gap-4"},{default:l(()=>[e(_,{color:"primary",onClick:m.submit,loading:a.loading},{default:l(()=>[t(" Create ")]),_:1},8,["onClick","loading"]),e(_,{color:"secondary",variant:"tonal",onClick:m.cancel},{default:l(()=>[t(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const T=g(w,[["render",B]]);export{T as default};
