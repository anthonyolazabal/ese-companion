import{n as c,p as g,r as C,o as h,q as w,w as l,i as e,s as o,v as b,x,y as n,l as r,z as p,A as y,B as U,C as f,m as V,f as k}from"./index.551e53aa.js";import{t as m}from"./form.50b7d74e.js";/* empty css              */import{V as B}from"./VForm.859299fb.js";import{V as _}from"./VTextField.5d7f987a.js";import{V as v}from"./VSelect.bd1af8f8.js";import{V as A}from"./VSlider.5e6608a1.js";import"./VSelectionControl.b73cc107.js";import"./VChip.41e4d8f5.js";const S={name:"AddCCUsers",data(){return{algo:"SHA512",algos:["SHA512","PKCS5S2","MD5"],iterations:[10,100],item:{password_iterations:100},loading:!1}},methods:{async submit(){this.loading=!0,this.item.username&&this.item.password&&this.item.algorithm?await this.$axios.post("/api/cc_user",this.item).then(i=>{m("Control center user created successfully",{type:"success",position:"bottom-center"}),c.push("cc-users-details?id="+i.data.id)}).catch(i=>{m(i.message,{type:"warning",position:"bottom-center"}),this.loading=!1}):m("Please fill all fields ! ",{type:"warning",position:"bottom-center"}),this.loading=!1},cancel(){c.push("/cc-users")}}},I=k("div",{class:"text-caption"}," Password iterations ",-1);function P(i,s,H,N,t,u){const d=C("RouterLink");return h(),w(f,null,{default:l(()=>[e(o,{cols:"12",md:"12"},{default:l(()=>[e(b,null,{prepend:l(()=>[e(x,{size:"small",icon:"mdi-home"})]),default:l(()=>[e(n,null,{default:l(()=>[e(d,{to:"/"},{default:l(()=>[r("Home")]),_:1})]),_:1}),e(p,null,{default:l(()=>[r(" / ")]),_:1}),e(n,null,{default:l(()=>[e(d,{to:"/cc-users"},{default:l(()=>[r(" Control Center Users ")]),_:1})]),_:1}),e(p,null,{default:l(()=>[r(" / ")]),_:1}),e(n,null,{default:l(()=>[e(d,{to:"/cc-users-add"},{default:l(()=>[r(" Add User ")]),_:1})]),_:1})]),_:1})]),_:1}),e(o,{cols:"12"},{default:l(()=>[e(y,{title:"Create a new control center user"},{default:l(()=>[e(U,null,{default:l(()=>[e(B,null,{default:l(()=>[e(f,{style:{"margin-top":"2px"}},{default:l(()=>[e(o,{cols:"12",md:"6",class:"d-flex gap-4"},{default:l(()=>[e(_,{modelValue:t.item.username,"onUpdate:modelValue":s[0]||(s[0]=a=>t.item.username=a),label:"Username",placeholder:"username"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:l(()=>[e(_,{modelValue:t.item.password,"onUpdate:modelValue":s[1]||(s[1]=a=>t.item.password=a),label:"Password",type:"password",placeholder:"password"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:l(()=>[e(v,{modelValue:t.item.algorithm,"onUpdate:modelValue":s[2]||(s[2]=a=>t.item.algorithm=a),items:t.algos,variant:"outlined",placeholder:"algorithm"},null,8,["modelValue","items"])]),_:1}),e(o,{cols:"12",md:"6"},{default:l(()=>[I,e(A,{modelValue:t.item.password_iterations,"onUpdate:modelValue":s[3]||(s[3]=a=>t.item.password_iterations=a),label:"Iterations",step:"10","thumb-label":"always",style:{"margin-right":"25px"}},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",class:"d-flex gap-4"},{default:l(()=>[e(V,{color:"primary",onClick:u.submit,loading:t.loading},{default:l(()=>[r(" Create ")]),_:1},8,["onClick","loading"]),e(V,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:l(()=>[r(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const j=g(S,[["render",P]]);export{j as default};
