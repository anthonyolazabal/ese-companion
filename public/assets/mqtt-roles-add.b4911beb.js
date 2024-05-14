import{m as c,n as g,r as h,o as C,p as x,w as l,g as e,q as o,s as b,v as y,x as r,k as t,y as f,z as k,A as R,B as p,l as _}from"./index.89cdcb0e.js";import{t as m}from"./form.5851ad77.js";/* empty css              */import{V as w}from"./VForm.a8fa7f1a.js";import{V}from"./VTextField.ade5f7c9.js";const B={name:"AddMQTTRoles",data(){return{item:{},loading:!1}},methods:{async submit(){this.loading=!0,this.item.name?await this.$axios.post("/api/role",this.item).then(s=>{m("Role created successfully",{type:"success",position:"bottom-center"}),c.push("/mqtt-roles-details?id="+s.data.id)}).catch(s=>{m("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"}),this.loading=!1}):(m("Please fill all fields ! ",{type:"warning",position:"bottom-center"}),this.loading=!1)},cancel(){c.push("/mqtt-roles")}}};function q(s,n,T,v,a,u){const d=h("RouterLink");return C(),x(p,null,{default:l(()=>[e(o,{cols:"12",md:"12"},{default:l(()=>[e(b,null,{prepend:l(()=>[e(y,{size:"small",icon:"mdi-home"})]),default:l(()=>[e(r,null,{default:l(()=>[e(d,{to:"/"},{default:l(()=>[t("Home")]),_:1})]),_:1}),e(f,null,{default:l(()=>[t(" / ")]),_:1}),e(r,null,{default:l(()=>[e(d,{to:"/mqtt-roles"},{default:l(()=>[t(" MQTT Roles ")]),_:1})]),_:1}),e(f,null,{default:l(()=>[t(" / ")]),_:1}),e(r,null,{default:l(()=>[e(d,{to:"/mqtt-roles-add"},{default:l(()=>[t(" Add Role ")]),_:1})]),_:1})]),_:1})]),_:1}),e(o,{cols:"12"},{default:l(()=>[e(k,{title:"Create a new role"},{default:l(()=>[e(R,null,{default:l(()=>[e(w,null,{default:l(()=>[e(p,{style:{"margin-top":"2px"}},{default:l(()=>[e(o,{cols:"12",md:"6",class:"d-flex gap-4"},{default:l(()=>[e(V,{modelValue:a.item.name,"onUpdate:modelValue":n[0]||(n[0]=i=>a.item.name=i),label:"Name",placeholder:"name"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:l(()=>[e(V,{modelValue:a.item.description,"onUpdate:modelValue":n[1]||(n[1]=i=>a.item.description=i),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",class:"d-flex gap-4"},{default:l(()=>[e(_,{color:"primary",onClick:u.submit,loading:a.loading},{default:l(()=>[t(" Create ")]),_:1},8,["onClick","loading"]),e(_,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:l(()=>[t(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const F=g(B,[["render",q]]);export{F as default};
