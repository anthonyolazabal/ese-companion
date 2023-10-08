import{J as P,M as _,D as F,L as x,g as h,F as S,i as o,a6 as V,aJ as L,P as M,a9 as E,aE as K,H as R,E as U,aK as j,a5 as A,aL as H,aM as J,aN as D,aH as z,l as G,G as q,ab as Q}from"./index.551e53aa.js";import{m as W,V as X}from"./VSelectionControl.b73cc107.js";import{V as Y}from"./VChip.41e4d8f5.js";import{V as Z}from"./VTextField.5d7f987a.js";const ee=P({indeterminate:Boolean,indeterminateIcon:{type:_,default:"$checkboxIndeterminate"},...W({falseIcon:"$checkboxOff",trueIcon:"$checkboxOn"})}),le=F({name:"VCheckboxBtn",props:ee(),emits:{"update:modelValue":e=>!0,"update:indeterminate":e=>!0},setup(e,C){let{slots:t,emit:k}=C;const d=x(e,"indeterminate");function n(y){d.value&&(d.value=!1),k("update:modelValue",y)}const r=h(()=>e.indeterminate?e.indeterminateIcon:e.falseIcon),I=h(()=>e.indeterminate?e.indeterminateIcon:e.trueIcon);return S(()=>o(X,V(e,{class:"v-checkbox-btn",type:"checkbox",inline:!0,"onUpdate:modelValue":n,falseIcon:r.value,trueIcon:I.value,"aria-checked":e.indeterminate?"mixed":void 0}),t)),{}}}),te=P({chips:Boolean,closableChips:Boolean,eager:Boolean,hideNoData:Boolean,hideSelected:Boolean,menu:Boolean,menuIcon:{type:_,default:"$dropdown"},menuProps:{type:Object},modelValue:{type:null,default:()=>[]},multiple:Boolean,noDataText:{type:String,default:"$vuetify.noDataText"},openOnClear:Boolean,readonly:Boolean,...L({itemChildren:!1})},"select"),se=M()({name:"VSelect",props:{...te(),...E({transition:{component:K}})},emits:{"update:modelValue":e=>!0,"update:menu":e=>!0},setup(e,C){let{slots:t}=C;const{t:k}=R(),d=U(),n=x(e,"menu"),{items:r,transformIn:I,transformOut:y}=j(e),u=x(e,"modelValue",[],l=>I(Q(l)),l=>{var c;const a=y(l);return e.multiple?a:(c=a[0])!=null?c:null}),g=h(()=>u.value.map(l=>r.value.find(a=>a.value===l.value)||l)),b=h(()=>g.value.map(l=>l.props.value));function $(l){u.value=[],e.openOnClear&&(n.value=!0)}function T(){e.hideNoData&&!r.value.length||e.readonly||(n.value=!n.value)}function w(l){e.readonly||(["Enter","ArrowDown"," "].includes(l.key)&&(n.value=!0),["Escape","Tab"].includes(l.key)&&(n.value=!1))}function f(l){if(e.multiple){const a=b.value.findIndex(c=>c===l.value);if(a===-1)u.value=[...u.value,l];else{const c=[...u.value];c.splice(a,1),u.value=c}}else u.value=[l],n.value=!1}return S(()=>{const l=!!(e.chips||t.chip);return o(Z,{ref:d,modelValue:u.value.map(a=>a.props.value).join(", "),"onUpdate:modelValue":a=>{a==null&&(u.value=[])},validationValue:u.externalValue,dirty:u.value.length>0,class:["v-select",{"v-select--active-menu":n.value,"v-select--chips":!!e.chips,[`v-select--${e.multiple?"multiple":"single"}`]:!0,"v-select--selected":u.value.length}],appendInnerIcon:e.menuIcon,readonly:!0,"onClick:clear":$,"onClick:control":T,onBlur:()=>n.value=!1,onKeydown:w},{...t,default:()=>{var a,c,B;return o(A,null,[o(H,V({modelValue:n.value,"onUpdate:modelValue":s=>n.value=s,activator:"parent",contentClass:"v-select__content",eager:e.eager,openOnClick:!1,closeOnContentClick:!1,transition:e.transition},e.menuProps),{default:()=>[o(J,{selected:b.value,selectStrategy:e.multiple?"independent":"single-independent",onMousedown:s=>s.preventDefault()},{default:()=>{var s;return[!r.value.length&&!e.hideNoData&&((s=(a=t["no-data"])==null?void 0:a.call(t))!=null?s:o(D,{title:k(e.noDataText)},null)),(c=t["prepend-item"])==null?void 0:c.call(t),r.value.map((i,p)=>{var v;var m;return(v=(m=t.item)==null?void 0:m.call(t,{item:i,index:p,props:V(i.props,{onClick:()=>f(i)})}))!=null?v:o(D,V({key:p},i.props,{onClick:()=>f(i)}),{prepend:O=>{let{isSelected:N}=O;return e.multiple&&!e.hideSelected?o(le,{modelValue:N,ripple:!1},null):void 0}})}),(B=t["append-item"])==null?void 0:B.call(t)]}})]}),g.value.map((s,i)=>{function p(v){v.stopPropagation(),v.preventDefault(),f(s)}const m={"onClick:close":p,modelValue:!0};return o("div",{key:i,class:"v-select__selection"},[l?o(z,{defaults:{VChip:{closable:e.closableChips,size:"small",text:s.title}}},{default:()=>[t.chip?t.chip({item:s,index:i,props:m}):o(Y,m,null)]}):t.selection?t.selection({item:s,index:i}):o("span",{class:"v-select__selection-text"},[s.title,e.multiple&&i<g.value.length-1&&o("span",{class:"v-select__selection-comma"},[G(",")])])])})])}})}),q({menu:n,select:f},d)}});export{se as V};
