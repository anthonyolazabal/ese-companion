import{m as u,n as _,r as y,o as g,p as w,w as t,g as e,q as r,s as b,v as x,x as m,k as l,y as c,z as C,ay as B,A as v,B as f,l as h,f as U}from"./index.998ab70e.js";import{t as n}from"./form.77a082ea.js";/* empty css              */import{V as k,a as q}from"./VBanner.8f75f177.js";import{V as A}from"./VForm.c9077497.js";import{V}from"./VTextField.16466e2b.js";import{V as E}from"./VSelect.f852e1e4.js";import{V as R}from"./VSlider.9c53eb97.js";import"./VSelectionControl.06cd081e.js";import"./VChip.3c763cc4.js";const S={name:"EditRestApiUsers",data(){return{algo:"SHA512",algos:["SHA512","PKCS5S2","MD5"],iterations:[10,100],item:{}}},methods:{async update(){this.item.username&&this.item.password?await this.$axios.put("/api/rest_api_user/"+this.$route.query.id,this.item).then(i=>{n("Rest Api user successfully updated",{type:"success",position:"bottom-center"})}).then(()=>{this.item={},this.$route.query.return=="details"?u.push("/rest-api-users-details?id="+this.$route.query.id):u.push("/rest-api-users")}).catch(()=>{n("Error updating rest api user, contact your admin ! ",{type:"warning",position:"bottom-center"})}):n("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){this.$route.query.return=="details"?u.push("/rest-api-users-details?id="+this.$route.query.id):u.push("/rest-api-users")}},async mounted(){await this.$axios.get("/api/rest_api_user/"+this.$route.query.id).then(i=>{this.item=i.data,this.algo=this.item.algorithm?this.item.algorithm:""}).then(()=>{this.item.password=""}).catch(i=>{n("Error loading the page, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}},I=U("div",{class:"text-caption"}," Password iterations ",-1);function P(i,a,T,D,s,p){const d=y("RouterLink");return g(),w(f,null,{default:t(()=>[e(r,{cols:"12",md:"12"},{default:t(()=>[e(b,null,{prepend:t(()=>[e(x,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(m,null,{default:t(()=>[e(d,{to:"/"},{default:t(()=>[l("Home")]),_:1})]),_:1}),e(c,null,{default:t(()=>[l(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/rest-api-users"},{default:t(()=>[l(" Rest Api Users ")]),_:1})]),_:1}),e(c,null,{default:t(()=>[l(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/rest-api-users-edit?id"+i.$route.query.id},{default:t(()=>[l(" Edit User ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(r,{cols:"12"},{default:t(()=>[e(C,{title:"Edit a rest api user"},{default:t(()=>[e(B,null,{default:t(()=>[e(k,{lines:"two",icon:"$warning",color:"warning",class:"my-4 elevation-20"},{default:t(()=>[e(q,null,{default:t(()=>[l(" Be aware that password hash is not reversible, so by editing the user you need to input again the password for the user (device). ")]),_:1})]),_:1})]),_:1}),e(v,null,{default:t(()=>[e(A,null,{default:t(()=>[e(f,{style:{"margin-top":"2px"}},{default:t(()=>[e(r,{cols:"12",md:"6"},{default:t(()=>[e(V,{modelValue:s.item.username,"onUpdate:modelValue":a[0]||(a[0]=o=>s.item.username=o),label:"Username",placeholder:"username"},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[e(V,{modelValue:s.item.password,"onUpdate:modelValue":a[1]||(a[1]=o=>s.item.password=o),label:"Password",type:"password",onmouseleave:"",placeholder:"password"},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[e(E,{modelValue:s.item.algorithm,"onUpdate:modelValue":a[2]||(a[2]=o=>s.item.algorithm=o),items:s.algos,variant:"outlined",placeholder:"algorithm"},null,8,["modelValue","items"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[I,e(R,{modelValue:s.item.password_iterations,"onUpdate:modelValue":a[3]||(a[3]=o=>s.item.password_iterations=o),label:"Iterations",step:"10","thumb-label":"always",style:{"margin-right":"25px"}},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",class:"d-flex gap-4"},{default:t(()=>[e(h,{color:"primary",onClick:p.update},{default:t(()=>[l(" Update ")]),_:1},8,["onClick"]),e(h,{color:"secondary",variant:"tonal",onClick:p.cancel},{default:t(()=>[l(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const J=_(S,[["render",P]]);export{J as default};
