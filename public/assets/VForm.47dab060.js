import{m as v,c as p}from"./form.21b59419.js";import{C as b,D as h,E as F,F as V,g as R}from"./index.0bb0cce8.js";const C=b({name:"VForm",props:{...v()},emits:{"update:modelValue":r=>!0,submit:r=>!0},setup(r,i){let{slots:s,emit:m}=i;const o=p(r),n=h();function u(t){t.preventDefault(),o.reset()}function f(t){const a=t,e=o.validate();a.then=e.then.bind(e),a.catch=e.catch.bind(e),a.finally=e.finally.bind(e),m("submit",a),a.defaultPrevented||e.then(d=>{let{valid:c}=d;if(c){var l;(l=n.value)==null||l.submit()}}),a.preventDefault()}return F(()=>{var t;return R("form",{ref:n,class:"v-form",novalidate:!0,onReset:u,onSubmit:f},[(t=s.default)==null?void 0:t.call(s,o)])}),V(o,n)}});export{C as V};
