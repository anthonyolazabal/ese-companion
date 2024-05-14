import{m as p,n as g,r as h,o as w,p as b,w as s,g as e,q as o,s as x,v as C,x as n,k as r,y as c,z as y,A,B as f,l as V,f as k}from"./index.89cdcb0e.js";import{t as m}from"./form.5851ad77.js";/* empty css              */import{V as U}from"./VForm.a8fa7f1a.js";import{V as _}from"./VTextField.ade5f7c9.js";import{V as B}from"./VSelect.e969673e.js";import{V as v}from"./VSlider.473b0ec9.js";import"./VSelectionControl.1996483b.js";import"./VChip.b766b57a.js";const R={name:"AddRestApiUsers",data(){return{algo:"SHA512",algos:["SHA512","PKCS5S2","MD5"],iterations:[10,100],item:{password_iterations:100},loading:!1}},methods:{async submit(){this.loading=!0,this.item.username&&this.item.password&&this.item.algorithm?await this.$axios.post("/api/rest_api_user",this.item).then(i=>{m("Rest Api user created successfully",{type:"success",position:"bottom-center"}),p.push("rest-api-users-details?id="+i.data.id)}).catch(i=>{m(i.message,{type:"warning",position:"bottom-center"}),this.loading=!1}):m("Please fill all fields ! ",{type:"warning",position:"bottom-center"}),this.loading=!1},cancel(){p.push("/rest-api-users")}}},S=k("div",{class:"text-caption"}," Password iterations ",-1);function I(i,l,P,H,t,u){const d=h("RouterLink");return w(),b(f,null,{default:s(()=>[e(o,{cols:"12",md:"12"},{default:s(()=>[e(x,null,{prepend:s(()=>[e(C,{size:"small",icon:"mdi-home"})]),default:s(()=>[e(n,null,{default:s(()=>[e(d,{to:"/"},{default:s(()=>[r("Home")]),_:1})]),_:1}),e(c,null,{default:s(()=>[r(" / ")]),_:1}),e(n,null,{default:s(()=>[e(d,{to:"/rest-api-users"},{default:s(()=>[r(" Rest Api Users ")]),_:1})]),_:1}),e(c,null,{default:s(()=>[r(" / ")]),_:1}),e(n,null,{default:s(()=>[e(d,{to:"/rest-api-users-add"},{default:s(()=>[r(" Add User ")]),_:1})]),_:1})]),_:1})]),_:1}),e(o,{cols:"12"},{default:s(()=>[e(y,{title:"Create a new rest api user"},{default:s(()=>[e(A,null,{default:s(()=>[e(U,null,{default:s(()=>[e(f,{style:{"margin-top":"2px"}},{default:s(()=>[e(o,{cols:"12",md:"6",class:"d-flex gap-4"},{default:s(()=>[e(_,{modelValue:t.item.username,"onUpdate:modelValue":l[0]||(l[0]=a=>t.item.username=a),label:"Username",placeholder:"username"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:s(()=>[e(_,{modelValue:t.item.password,"onUpdate:modelValue":l[1]||(l[1]=a=>t.item.password=a),label:"Password",type:"password",placeholder:"password"},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",md:"6"},{default:s(()=>[e(B,{modelValue:t.item.algorithm,"onUpdate:modelValue":l[2]||(l[2]=a=>t.item.algorithm=a),items:t.algos,variant:"outlined",placeholder:"algorithm"},null,8,["modelValue","items"])]),_:1}),e(o,{cols:"12",md:"6"},{default:s(()=>[S,e(v,{modelValue:t.item.password_iterations,"onUpdate:modelValue":l[3]||(l[3]=a=>t.item.password_iterations=a),label:"Iterations",step:"10","thumb-label":"always",style:{"margin-right":"25px"}},null,8,["modelValue"])]),_:1}),e(o,{cols:"12",class:"d-flex gap-4"},{default:s(()=>[e(V,{color:"primary",onClick:u.submit,loading:t.loading},{default:s(()=>[r(" Create ")]),_:1},8,["onClick","loading"]),e(V,{color:"secondary",variant:"tonal",onClick:u.cancel},{default:s(()=>[r(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const j=g(R,[["render",I]]);export{j as default};
