import{m as y,f as A,V as $}from"./VSelectionControl.1996483b.js";import{b as B,f as I,c as L}from"./VTextField.ade5f7c9.js";import{C as R,K as D,R as U,L as r,S as j,E as z,aj as E,D as K,g as t,a6 as d,a1 as M,bw as N}from"./index.89cdcb0e.js";const O=R({name:"VSwitch",inheritAttrs:!1,props:{indeterminate:Boolean,inset:Boolean,flat:Boolean,loading:{type:[Boolean,String],default:!1},...B(),...y()},emits:{"update:indeterminate":e=>!0},setup(e,u){let{attrs:c,slots:a}=u;const n=D(e,"indeterminate"),{loaderClasses:v}=U(e),f=r(()=>typeof e.loading=="string"&&e.loading!==""?e.loading:e.color),m=j(),h=r(()=>e.id||`switch-${m}`);function C(){n.value&&(n.value=!1)}return z(()=>{const[g,w]=E(c),[V,q]=I(e),[k,F]=A(e),s=K();function p(){var l,i;(l=s.value)==null||(i=l.input)==null||i.click()}return t(L,d({class:["v-switch",{"v-switch--inset":e.inset},{"v-switch--indeterminate":n.value},v.value]},g,V,{id:h.value}),{...a,default:l=>{let{id:i,isDisabled:S,isReadonly:_,isValid:P}=l;return t($,d({ref:s},k,{id:i.value,type:"checkbox","onUpdate:modelValue":C,"aria-checked":n.value?"mixed":void 0,disabled:S.value,readonly:_.value},w),{...a,default:()=>t("div",{class:"v-switch__track",onClick:p},null),input:b=>{let{textColorClasses:x}=b;return t("div",{class:["v-switch__thumb",x.value]},[e.loading&&t(M,{name:"v-switch",active:!0,color:P.value===!1?void 0:f.value},{default:o=>a.loader?a.loader(o):t(N,{active:o.isActive,color:o.color,indeterminate:!0,size:"16",width:"2"},null)})])}})}})}),{}}});export{O as V};
