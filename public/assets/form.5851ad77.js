import{d as K,g as v,o as m,p as f,D as g,af as P,ap as R,L as E,aq as Q,r as Z,w as ee,ar as C,t as j,as as te,at as oe,au as Y,I as se,K as ne,X as ie,av as ae,aw as re,ax as le}from"./index.89cdcb0e.js";var ue=Object.defineProperty,pe=Object.defineProperties,ce=Object.getOwnPropertyDescriptors,q=Object.getOwnPropertySymbols,de=Object.prototype.hasOwnProperty,ve=Object.prototype.propertyIsEnumerable,U=(e,t,o)=>t in e?ue(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,b=(e,t)=>{for(var o in t||(t={}))de.call(t,o)&&U(e,o,t[o]);if(q)for(var o of q(t))ve.call(t,o)&&U(e,o,t[o]);return e},$=(e,t)=>pe(e,ce(t));const L={type:"default",timeout:5e3,showCloseButton:!0,position:"top-right",transition:"bounce",hideProgressBar:!1,swipeClose:!0};var x,T;(T=x||(x={}))[T.TITLE_ONLY=0]="TITLE_ONLY",T[T.TITLE_DESCRIPTION=1]="TITLE_DESCRIPTION",T[T.COMPONENT=2]="COMPONENT",T[T.VNODE=3]="VNODE";const he={"top-left":{bounce:"mosha__bounceInLeft",zoom:"mosha__zoomIn",slide:"mosha__slideInLeft"},"top-right":{bounce:"mosha__bounceInRight",zoom:"mosha__zoomIn",slide:"mosha__slideInRight"},"top-center":{bounce:"mosha__bounceInDown",zoom:"mosha__zoomIn",slide:"mosha__slideInDown"},"bottom-center":{bounce:"mosha__bounceInUp",zoom:"mosha__zoomIn",slide:"mosha__slideInUp"},"bottom-right":{bounce:"mosha__bounceInRight",zoom:"mosha__zoomIn",slide:"mosha__slideInRight"},"bottom-left":{bounce:"mosha__bounceInLeft",zoom:"mosha__zoomIn",slide:"mosha__slideInLeft"}},X=(e,t=300)=>{let o;return(...n)=>{o&&(clearTimeout(o),o=void 0),o=setTimeout(()=>e(...n),t)}},me=(e,t,o)=>{const n=g(),i=g(void 0),s=g(),u=c=>c instanceof MouseEvent,r=c=>{o!==!1&&n.value&&(u(c)?i.value=n.value.clientX-c.clientX:i.value=n.value.touches[0].clientX-c.touches[0].clientX,s.value=$(b({},s.value),{transition:"none"}),e.endsWith("left")?s.value.left=-i.value+"px !important":e.endsWith("right")?s.value.right=`${i.value}px !important`:i.value>0?s.value.left=-i.value+"px !important":s.value.right=`${i.value}px !important`,Math.abs(i.value)>200&&t())},_=c=>{o!==!1&&(n.value&&(n.value=void 0),i.value&&(i.value=void 0),removeEventListener(c,r))};return R(()=>{o!==!1&&(_("mousemove"),_("touchmove"))}),{swipedDiff:i,swipeStart:n,swipeStyle:s,swipeHandler:r,startSwipeHandler:c=>{if(o===!1)return;n.value=c;const l=u(c)?"mousemove":"touchmove",a=u(c)?"mouseup":"touchend";addEventListener(l,r),addEventListener(a,()=>(d=>{const p={transition:"left .3s ease-out",left:0},I={transition:"right .3s ease-out",right:0},S={transition:"all .3s ease-out",left:0,right:0};e.endsWith("left")?s.value=b(b({},s.value),p):e.endsWith("right")?s.value=b(b({},s.value),I):s.value=b(b({},s.value),S),n.value=void 0,i.value=void 0,removeEventListener(d,r)})(l))},cleanUpMove:_}};var A=K({props:{type:{type:String,default:"default"}}});const fe={class:"mosha__icon"},ge={key:0,xmlns:"http://www.w3.org/2000/svg",height:"32px",viewBox:"0 0 24 24",width:"32px",fill:"#ffffff"},we=v("path",{d:"M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"},null,-1),_e={key:1,xmlns:"http://www.w3.org/2000/svg",height:"32px",viewBox:"0 0 24 24",width:"32px",fill:"#ffffff"},ye=v("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z"},null,-1),be={key:2,xmlns:"http://www.w3.org/2000/svg",height:"32px",viewBox:"0 0 24 24",width:"32px",fill:"#ffffff"},Ie=v("path",{d:"M0 0h24v24H0V0z",fill:"none"},null,-1),Me=v("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.59 7.59c-.38.39-1.02.39-1.41 0z"},null,-1),Te={key:3,xmlns:"http://www.w3.org/2000/svg",height:"32px",viewBox:"0 0 24 24",width:"32px",fill:"#616161"},Ce=v("path",{d:"M0 0h24v24H0z",fill:"none"},null,-1),xe=v("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"},null,-1),Ee={key:4,xmlns:"http://www.w3.org/2000/svg",height:"32px",viewBox:"0 0 24 24",width:"32px",fill:"#ffffff"},ze=v("path",{d:"M0 0h24v24H0z",fill:"none"},null,-1),Se=v("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"},null,-1);A.render=function(e,t,o,n,i,s){return m(),f("span",fe,[e.type==="warning"?(m(),f("svg",ge,[we])):e.type==="danger"?(m(),f("svg",_e,[ye])):e.type==="success"?(m(),f("svg",be,[Ie,Me])):e.type==="default"?(m(),f("svg",Te,[Ce,xe])):(m(),f("svg",Ee,[ze,Se]))])};var O=K({name:"MToast",components:{MIcon:A},props:{visible:Boolean,text:{type:String,default:""},description:{type:String,default:""},toastBackgroundColor:{type:String,default:""},type:{type:String,default:"default"},onClose:{type:Function,default:()=>null},onCloseHandler:{type:Function,required:!0},offset:{type:Number,required:!0},id:{type:Number,required:!0},timeout:{type:Number,default:5e3},position:{type:String,required:!0},showCloseButton:{type:Boolean,default:!0},swipeClose:{type:Boolean,default:!0},hideProgressBar:{type:Boolean,default:!1},showIcon:{type:Boolean,default:!1},transition:{type:String,default:"bounce"}},setup(e,t){const o=g(),{width:n}=(()=>{const w=g(-1),M=g(-1),h=y=>{y!==null&&y.currentTarget!==null&&(w.value=y.currentTarget.innerWidth,M.value=y.currentTarget.innerHeight)};return P(()=>{window.innerWidth>0&&(w.value=window.innerWidth,M.value=window.innerHeight),window.addEventListener("resize",X(h))}),R(()=>{window.removeEventListener("resize",X(h))}),{width:w,height:M}})(),{swipedDiff:i,startSwipeHandler:s,swipeStyle:u,cleanUpMove:r}=me(e.position,e.onCloseHandler,e.swipeClose),{transitionType:_}=(c=e.position,l=e.transition,a=i,{transitionType:E(()=>a.value>200?"mosha__fadeOutLeft":a.value<-200?"mosha__fadeOutRight":he[c][l])});var c,l,a;const{start:d,stop:p,progress:I}=((w,M)=>{const h=g(),y=g(0),B=g(M),D=g(),F=g(100),W=()=>{clearInterval(D.value),clearTimeout(h.value)};return P(()=>{}),R(()=>{W()}),{start:()=>{y.value=Date.now(),clearTimeout(h.value),D.value=setInterval(()=>{F.value--},M/100-5),h.value=setTimeout(w,B.value)},stop:()=>{clearInterval(D.value),clearTimeout(h.value),B.value-=Date.now()-y.value},clear:W,progress:F}})(()=>{e.onCloseHandler()},e.timeout),S=E(()=>t.slots.default),J=E(()=>/<\/?[a-z][\s\S]*>/i.test(e.description)),V=()=>{e.timeout>0&&d()};return Q(()=>{const{customStyle:w}=((M,h,y)=>{const B=E(()=>{switch(M){case"top-left":return{left:"0",top:`${h}px`};case"bottom-left":return{left:"0",bottom:`${h}px`};case"bottom-right":return{right:"0",bottom:`${h}px`};case"top-center":return{top:`${h}px`,left:"0",right:"0",marginRight:"auto",marginLeft:"auto"};case"bottom-center":return{bottom:`${h}px`,left:"0",right:"0",marginRight:"auto",marginLeft:"auto"};default:return{right:"0",top:`${h}px`}}});return y.length>0&&(B.value.backgroundColor=y),{customStyle:B}})(e.position,e.offset,e.toastBackgroundColor);o.value=w.value}),P(()=>{V()}),{style:o,transitionType:_,startTimer:V,progress:I,onTouchStart:w=>{s(w)},onMouseLeave:()=>{r("mousemove"),V()},onMouseDown:w=>{s(w)},swipeStyle:u,isSlotPassed:S,isDescriptionHtml:J,onMouseEnter:()=>{e.timeout>0&&n.value>425&&p()}}}});const Be={class:"mosha__toast__content-wrapper"},Le={class:"mosha__toast__content"},Oe={class:"mosha__toast__content__text"},Ne={key:1,class:"mosha__toast__content__description"},Ve={key:0,class:"mosha__toast__slot-wrapper"};O.render=function(e,t,o,n,i,s){const u=Z("MIcon");return m(),f(oe,{name:e.transitionType,type:"animation"},{default:ee(()=>[e.visible?(m(),f("div",{key:0,class:["mosha__toast",e.toastBackgroundColor?null:e.type],style:[e.style,e.swipeStyle],onMouseenter:t[2]||(t[2]=(...r)=>e.onMouseEnter&&e.onMouseEnter(...r)),onMouseleave:t[3]||(t[3]=(...r)=>e.onMouseLeave&&e.onMouseLeave(...r)),onTouchstartPassive:t[4]||(t[4]=(...r)=>e.onTouchStart&&e.onTouchStart(...r)),onMousedown:t[5]||(t[5]=(...r)=>e.onMouseDown&&e.onMouseDown(...r))},[v("div",Be,[e.showIcon?(m(),f(u,{key:0,type:e.type},null,8,["type"])):C("",!0),v("div",Le,[v("div",Oe,j(e.text),1),e.description.length>0&&e.isDescriptionHtml?(m(),f("div",{key:0,class:"mosha__toast__content__description",innerHTML:e.description},null,8,["innerHTML"])):C("",!0),e.description.length>0&&!e.isDescriptionHtml?(m(),f("div",Ne,j(e.description),1)):C("",!0)])]),e.isSlotPassed?(m(),f("div",Ve,[te(e.$slots,"default")])):C("",!0),e.showCloseButton?(m(),f("div",{key:1,class:"mosha__toast__close-icon",onClick:t[1]||(t[1]=(...r)=>e.onCloseHandler&&e.onCloseHandler(...r))})):C("",!0),e.hideProgressBar?C("",!0):(m(),f("div",{key:2,class:"mosha__toast__progress",style:{width:`${e.progress}%`}},null,4))],38)):C("",!0)]),_:3},8,["name"])};const N={"top-left":[],"top-right":[],"bottom-left":[],"bottom-right":[],"top-center":[],"bottom-center":[]};let De=0;const $e=(e,t)=>{const o=De++,n=t?Pe(t):L;if(e.__v_isVNode)return k(o,x.VNODE,n,e),{close:()=>z(o,n.position)};if(e.hasOwnProperty("render"))return k(o,x.COMPONENT,n,e),{close:()=>z(o,n.position)};const i=ke(e);return k(o,x.TITLE_DESCRIPTION,n,i),{close:()=>z(o,n.position)}},k=(e,t,o,n)=>{setTimeout(()=>{const i=He(o,N,12),s=document.createElement("div");let u;document.body.appendChild(s),u=t===x.VNODE?v(O,H(o,e,i,z),()=>[n]):t===x.TITLE_DESCRIPTION?v(O,H(o,e,i,z,n)):v(O,H(o,e,i,z),()=>[v(n)]),Y(u,s),N[o.position].push({toastVNode:u,container:s}),u.component&&(u.component.props.visible=!0)},1)},H=(e,t,o,n,i)=>$(b(b({},e),i),{id:t,offset:o,visible:!1,onCloseHandler:()=>{n(t,e.position?e.position:"top-right")}}),Pe=e=>{const t=$(b({},e),{type:e.type||L.type,timeout:e.timeout||L.timeout,showCloseButton:e.showCloseButton,position:e.position||L.position,showIcon:e.showIcon,swipeClose:e.swipeClose,transition:e.transition||L.transition});return t.hideProgressBar=t.timeout!==void 0&&t.timeout<=0,e.hideProgressBar!==void 0&&(t.hideProgressBar=e.hideProgressBar),t},ke=e=>({text:typeof e=="string"?e:e.title,description:typeof e=="string"?void 0:e.description}),He=(e,t,o)=>{let n=o;if(!e.position)throw new Error("no position");return t[e.position].forEach(({toastVNode:i})=>{n+=i.el.offsetHeight+o||0}),n},z=(e,t)=>{const o=N[t],n=o.findIndex(({toastVNode:r})=>r.props&&e===r.props.id);if(n===-1)return;const{container:i,toastVNode:s}=o[n];if(!s.el)return;const u=s.el.offsetHeight;N[t].splice(n,1),((r,_,c,l)=>{for(let a=r;a<_.length;a++){const{toastVNode:d}=_[a];if(!d.el)return;const p=c.split("-")[0]||"top",I=parseInt(d.el.style[p],10)-l-12;if(!d.component)return;d.component.props.offset=I}})(n,o,t,u),s.component&&(s.component.props.visible=!1,s.component.props.onClose&&s.component.props.onClose(),setTimeout(()=>{Y(null,i),document.body.removeChild(i)},1e3))},G=Symbol.for("vuetify:form"),Fe=se({disabled:Boolean,fastFail:Boolean,lazyValidation:Boolean,readonly:Boolean,modelValue:{type:Boolean,default:null}});function We(e){const t=ne(e,"modelValue"),o=E(()=>e.disabled),n=E(()=>e.readonly),i=g(!1),s=g([]),u=g([]);async function r(){const l=[];let a=!0;u.value=[],i.value=!0;for(const d of s.value){const p=await d.validate();if(p.length>0&&(a=!1,l.push({id:d.id,errorMessages:p})),!a&&e.fastFail)break}return u.value=l,i.value=!1,{valid:a,errors:u.value}}function _(){s.value.forEach(l=>l.reset()),t.value=null}function c(){s.value.forEach(l=>l.resetValidation()),u.value=[],t.value=null}return ie(s,()=>{let l=0,a=0;const d=[];for(const p of s.value)p.isValid===!1?(a++,d.push({id:p.id,errorMessages:p.errorMessages})):p.isValid===!0&&l++;u.value=d,t.value=a>0?!1:l===s.value.length?!0:null},{deep:!0}),ae(G,{register:l=>{let{id:a,validate:d,reset:p,resetValidation:I}=l;s.value.some(S=>S.id===a)&&re(`Duplicate input name "${a}"`),s.value.push({id:a,validate:d,reset:p,resetValidation:I,isValid:null,errorMessages:[]})},unregister:l=>{s.value=s.value.filter(a=>a.id!==l)},update:(l,a,d)=>{const p=s.value.find(I=>I.id===l);!p||(p.isValid=a,p.errorMessages=d)},isDisabled:o,isReadonly:n,isValidating:i,items:s}),{errors:u,isDisabled:o,isReadonly:n,isValidating:i,items:s,validate:r,reset:_,resetValidation:c}}function je(){return le(G,null)}export{We as c,Fe as m,$e as t,je as u};