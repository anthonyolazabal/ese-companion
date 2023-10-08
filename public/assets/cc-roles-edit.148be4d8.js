import{m as i,n as V,r as y,o as C,p as g,w as t,g as e,q as a,s as x,v as b,x as c,k as l,y as p,z as k,A as q,B as f,l as _}from"./index.40a940c5.js";import{t as n}from"./form.35e1d7cc.js";/* empty css              */import{V as w}from"./VForm.a6d981bf.js";import{V as h}from"./VTextField.1b52f8bd.js";const B={name:"EditCCRoles",data(){return{item:{}}},methods:{async update(){this.item.name&&this.item.description?await this.$axios.put("/api/cc_role/"+this.$route.query.id,this.item).then(o=>{n("Control panel center successfully updated",{type:"success",position:"bottom-center"}),this.item={},this.$route.query.return=="details"?i.push("/cc-roles-details?id="+this.$route.query.id):i.push("/cc-roles")}).catch(()=>{n("Error updating control center role, contact your admin ! ",{type:"warning",position:"bottom-center"})}):n("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){this.$route.query.return=="details"?i.push("/cc-roles-details?id="+this.$route.query.id):i.push("/cc-roles")}},async mounted(){await this.$axios.get("/api/cc_role/"+this.$route.query.id).then(o=>{this.item=o.data}).catch(o=>{n("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}};function R(o,r,$,E,s,m){const d=y("RouterLink");return C(),g(f,null,{default:t(()=>[e(a,{cols:"12",md:"12"},{default:t(()=>[e(x,null,{prepend:t(()=>[e(b,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(c,null,{default:t(()=>[e(d,{to:"/"},{default:t(()=>[l("Home")]),_:1})]),_:1}),e(p,null,{default:t(()=>[l(" / ")]),_:1}),e(c,null,{default:t(()=>[e(d,{to:"/cc-roles"},{default:t(()=>[l(" Control Center Roles ")]),_:1})]),_:1}),e(p,null,{default:t(()=>[l(" / ")]),_:1}),e(c,null,{default:t(()=>[e(d,{to:"/cc-roles-edit?id"+o.$route.query.id},{default:t(()=>[l(" Edit Role ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(a,{cols:"12"},{default:t(()=>[e(k,{title:"Edit a control center role"},{default:t(()=>[e(q,null,{default:t(()=>[e(w,null,{default:t(()=>[e(f,{style:{"margin-top":"2px"}},{default:t(()=>[e(a,{cols:"12",md:"6"},{default:t(()=>[e(h,{modelValue:s.item.name,"onUpdate:modelValue":r[0]||(r[0]=u=>s.item.name=u),label:"Name",placeholder:"name"},null,8,["modelValue"])]),_:1}),e(a,{cols:"12",md:"6"},{default:t(()=>[e(h,{modelValue:s.item.description,"onUpdate:modelValue":r[1]||(r[1]=u=>s.item.description=u),label:"Description",placeholder:"description"},null,8,["modelValue"])]),_:1}),e(a,{cols:"12",class:"d-flex gap-4"},{default:t(()=>[e(_,{color:"primary",onClick:m.update},{default:t(()=>[l(" Update ")]),_:1},8,["onClick"]),e(_,{color:"secondary",variant:"tonal",onClick:m.cancel},{default:t(()=>[l(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const z=V(B,[["render",R]]);export{z as default};
