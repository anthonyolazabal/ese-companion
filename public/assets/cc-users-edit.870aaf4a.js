import{n,p as _,r as y,o as g,q as w,w as t,i as e,s as r,v as C,x as b,y as m,l as o,z as p,A as x,ay as B,B as v,C as f,m as h,f as U}from"./index.3b184585.js";import{t as u}from"./form.3ba9d24b.js";/* empty css              */import{V as k,a as q}from"./VBanner.e3a8123e.js";import{V as E}from"./VForm.20c01160.js";import{V}from"./VTextField.aab1089a.js";import{V as S}from"./VSelect.00d24c7c.js";import{V as I}from"./VSlider.c888f4f0.js";import"./VCheckboxBtn.a000f421.js";import"./VSelectionControl.d5f42bec.js";import"./VChip.46a960f4.js";const P={name:"EditCCUsers",data(){return{algo:"SHA512",algos:["SHA512","PKCS5S2","MD5"],iterations:[10,100],item:{}}},methods:{async update(){this.item.username&&this.item.password?await this.$axios.put("/cc_user/"+this.$route.query.id,this.item).then(i=>{u("Control panel user successfully updated",{type:"success",position:"bottom-center"})}).then(()=>{this.item={},this.$route.query.return=="details"?n.push("/cc-users-details?id="+this.$route.query.id):n.push("/cc-users")}).catch(()=>{u("Error updating control panel user, contact your admin ! ",{type:"warning",position:"bottom-center"})}):u("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){this.$route.query.return=="details"?n.push("/cc-users-details?id="+this.$route.query.id):n.push("/cc-users")}},async mounted(){await this.$axios.get("/cc_user/"+this.$route.query.id).then(i=>{this.item=i.data,this.algo=this.item.algorithm?this.item.algorithm:""}).then(()=>{this.item.password=""}).catch(i=>{u("Error loading the page, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}},T=U("div",{class:"text-caption"}," Password iterations ",-1);function A(i,a,D,H,s,c){const d=y("RouterLink");return g(),w(f,null,{default:t(()=>[e(r,{cols:"12",md:"12"},{default:t(()=>[e(C,null,{prepend:t(()=>[e(b,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(m,null,{default:t(()=>[e(d,{to:"/"},{default:t(()=>[o("Home")]),_:1})]),_:1}),e(p,null,{default:t(()=>[o(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/cc-users"},{default:t(()=>[o(" Control Center Users ")]),_:1})]),_:1}),e(p,null,{default:t(()=>[o(" / ")]),_:1}),e(m,null,{default:t(()=>[e(d,{to:"/cc-users-edit?id"+i.$route.query.id},{default:t(()=>[o(" Edit User ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(r,{cols:"12"},{default:t(()=>[e(x,{title:"Edit a control panel user"},{default:t(()=>[e(B,null,{default:t(()=>[e(k,{lines:"two",icon:"$warning",color:"warning",class:"my-4 elevation-20"},{default:t(()=>[e(q,null,{default:t(()=>[o(" Be aware that password hash is not reversible, so by editing the user you need to input again the password for the user (device). ")]),_:1})]),_:1})]),_:1}),e(v,null,{default:t(()=>[e(E,null,{default:t(()=>[e(f,{style:{"margin-top":"2px"}},{default:t(()=>[e(r,{cols:"12",md:"6"},{default:t(()=>[e(V,{modelValue:s.item.username,"onUpdate:modelValue":a[0]||(a[0]=l=>s.item.username=l),label:"Username",placeholder:"username"},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[e(V,{modelValue:s.item.password,"onUpdate:modelValue":a[1]||(a[1]=l=>s.item.password=l),label:"Password",type:"password",onmouseleave:"",placeholder:"password"},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[e(S,{modelValue:s.item.algorithm,"onUpdate:modelValue":a[2]||(a[2]=l=>s.item.algorithm=l),items:s.algos,variant:"outlined",placeholder:"algorithm"},null,8,["modelValue","items"])]),_:1}),e(r,{cols:"12",md:"6"},{default:t(()=>[T,e(I,{modelValue:s.item.password_iterations,"onUpdate:modelValue":a[3]||(a[3]=l=>s.item.password_iterations=l),label:"Iterations",step:"10","thumb-label":"always",style:{"margin-right":"25px"}},null,8,["modelValue"])]),_:1}),e(r,{cols:"12",class:"d-flex gap-4"},{default:t(()=>[e(h,{color:"primary",onClick:c.update},{default:t(()=>[o(" Update ")]),_:1},8,["onClick"]),e(h,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:t(()=>[o(" Cancel ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const O=_(P,[["render",A]]);export{O as default};
