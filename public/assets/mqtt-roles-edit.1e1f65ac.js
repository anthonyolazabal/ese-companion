import{m as r,n as V,r as y,o as q,p as g,w as t,g as e,q as a,s as x,v as C,x as m,k as l,y as p,z as b,A as k,B as f,l as _}from"./index.ddc7c489.js";import{t as n}from"./form.e67fff3c.js";/* empty css              */import{V as w}from"./VForm.7d086d98.js";import{V as h}from"./VTextField.9ad36453.js";const R={name:"EditMQTTRoles",data(){return{item:{}}},methods:{async update(){this.item.name&&this.item.description?await this.$axios.put("/api/role/"+this.$route.query.id,this.item).then(o=>{n("Role successfully updated",{type:"success",position:"bottom-center"}),this.item={},this.$route.query.return=="details"?r.push("/mqtt-roles-details?id="+this.$route.query.id):r.push("/mqtt-roles")}).catch(()=>{n("Error updating role, contact your admin ! ",{type:"warning",position:"bottom-center"})}):n("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){this.$route.query.return=="details"?r.push("/mqtt-roles-details?id="+this.$route.query.id):r.push("/mqtt-roles")}},async mounted(){await this.$axios.get("/api/role/"+this.$route.query.id).then(o=>{this.item=o.data}).catch(o=>{n("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}};function T(o,s,B,$,i,c){const d=y("RouterLink");return q(),g(f,null,{default:t(()=>[e(a,{cols:"12",md:"12"},{default:t(()=>[e(x,null,{prepend:t(()=>[e(C,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(m,null,{default:t(()=>[e(d,{to:"/"},{default:t(()=>[l("Home")]),_:1})]),_:1}),e(p,null,{default:t(()=>[l(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/mqtt-roles"},{default:t(()=>[l(" MQTT Roles ")]),_:1})]),_:1}),e(p,null,{default:t(()=>[l(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/mqtt-roles-edit?id"+o.$route.query.id},{default:t(()=>[l(" Edit Role ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(a,{cols:"12"},{default:t(()=>[e(b,{title:"Edit a MQTT role"},{default:t(()=>[e(k,null,{default:t(()=>[e(w,null,{default:t(()=>[e(f,{style:{"margin-top":"2px"}},{default:t(()=>[e(a,{cols:"12",md:"6"},{default:t(()=>[e(h,{modelValue:i.item.name,"onUpdate:modelValue":s[0]||(s[0]=u=>i.item.name=u),label:"Name",placeholder:"name"},null,8,["modelValue"])]),_:1}),e(a,{cols:"12",md:"6"},{default:t(()=>[e(h,{modelValue:i.item.description,"onUpdate:modelValue":s[1]||(s[1]=u=>i.item.description=u),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1}),e(a,{cols:"12",class:"d-flex gap-4"},{default:t(()=>[e(_,{color:"primary",onClick:c.update},{default:t(()=>[l(" Update ")]),_:1},8,["onClick"]),e(_,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:t(()=>[l(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const N=V(R,[["render",T]]);export{N as default};
