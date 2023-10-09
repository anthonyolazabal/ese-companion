import{d as y,u as g,D as p,o as V,e as k,g as e,w as s,A as x,j as c,i as n,bt as C,be as v,k as u,ay as f,bu as E,B as T,q as _,l as w,z as B,f as r,bv as S,m as D}from"./index.998ab70e.js";import{t as d}from"./form.77a082ea.js";/* empty css              */import{V as I}from"./VForm.c9077497.js";import{V as b}from"./VTextField.16466e2b.js";import{b as h}from"./route-block.011d1056.js";const P="/assets/simple.5f9e6416.png",U={class:"auth-wrapper d-flex align-center justify-center pa-4"},j=r("br",null,null,-1),q=r("p",{class:"mb-0"}," Please sign-in with an account allowed on the Enterprise Security Extension Rest Api ",-1),A=r("br",null,null,-1),N=r("br",null,null,-1),i=S(),R={name:"Login",data(){return{username:p(""),password:p("")}},methods:{async login(){let m={username:this.username,password:this.password};await this.$axios.post("/api/login",m).then(t=>{i.updateToken(t.data.token),i.updateUsername(t.data.username),i.updatePassword(this.password),i.updateIsAuthenticated(!0),D.push("/")}).catch(function(t){t.response?d("Error authenticating user, contact your admin ! Details : "+t.response.data,{type:"warning",position:"bottom-center"}):t.request?d("Error in request, contact your admin ! Details : "+t,{type:"warning",position:"bottom-center"}):d("Error, contact your admin ! Details : "+t.message,{type:"warning",position:"bottom-center"})})}}},F=y({...R,setup(m){g();const t=p(!1);return(o,a)=>(V(),k("div",U,[e(B,{class:"auth-card pa-4 pt-7","max-width":"448"},{default:s(()=>[e(x,{class:"justify-center"},{default:s(()=>[e(c,{style:{"margin-left":"auto","margin-right":"auto"},src:n(C),width:100},null,8,["src"]),j,e(v,{class:"font-weight-semibold text-2xl text-uppercase"},{default:s(()=>[u(" ESE Companion ")]),_:1})]),_:1}),e(f,{class:"pt-2 text-center"},{default:s(()=>[q]),_:1}),e(f,null,{default:s(()=>[e(I,{onSubmit:E(()=>{},["prevent"])},{default:s(()=>[e(T,null,{default:s(()=>[e(_,{cols:"12"},{default:s(()=>[e(b,{modelValue:o.username,"onUpdate:modelValue":a[0]||(a[0]=l=>o.username=l),label:"Username",type:"text"},null,8,["modelValue"])]),_:1}),e(_,{cols:"12"},{default:s(()=>[e(b,{modelValue:o.password,"onUpdate:modelValue":a[1]||(a[1]=l=>o.password=l),label:"Password",type:n(t)?"text":"password","append-inner-icon":n(t)?"mdi-eye-off-outline":"mdi-eye-outline","onClick:appendInner":a[2]||(a[2]=l=>t.value=!n(t))},null,8,["modelValue","type","append-inner-icon"]),A,e(w,{block:"",type:"submit",onClick:o.login},{default:s(()=>[u(" Login ")]),_:1},8,["onClick"]),N,e(w,{block:"",color:"secondary",variant:"tonal",type:"reset"},{default:s(()=>[u(" Reset ")]),_:1})]),_:1})]),_:1})]),_:1},8,["onSubmit"])]),_:1})]),_:1}),e(c,{src:n(P),class:"auth-footer-end-tree d-none d-md-block",width:550},null,8,["src"])]))}});typeof h=="function"&&h(F);export{F as default};