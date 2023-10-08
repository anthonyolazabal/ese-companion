import{n as u,p as g,r as m,o as b,q as x,w as e,i as t,s as r,v as V,x as d,y as _,l as o,z as D,A as k,B as f,C as p,m as w,f as i,t as h,aA as B}from"./index.16be124a.js";import{h as y}from"./moment.9709ab41.js";import{_ as I}from"./loading-bee.8d7bf3b7.js";const R={name:"CCRoles",data(){return{headers:[{text:"Name",value:"name",sortable:!0},{text:"Description",value:"description"},{text:"Created",value:"created_at",sortable:!0},{text:"Last Updated",value:"updated_at",sortable:!0},{text:"Operations",value:"operation"}],itemsSelected:[],items:[],loading:!0,isEditing:!1,editingItem:null}},methods:{formatDate(a){if(a)return y(String(a)).format("MM/DD/YYYY hh:mm")},deleteItem(a){u.push("/cc-roles-delete?id="+a.id)},viewItem:function(a){u.push("/cc-roles-details?id="+a.id)}},async mounted(){await this.$axios.get("/api/cc_roles").then(a=>{this.items=a.data,this.loading=!1}).catch(a=>{console.log(a)})}},z=i("img",{src:I,style:{width:"6.25rem",height:"6.25rem"},alt:"Bee"},null,-1),E={class:"operation-wrapper"};function N(a,L,S,Y,n,s){const c=m("RouterLink"),C=m("EasyDataTable");return b(),x(p,null,{default:e(()=>[t(r,{cols:"12",md:"12"},{default:e(()=>[t(V,null,{prepend:e(()=>[t(d,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(_,null,{default:e(()=>[t(c,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(D,null,{default:e(()=>[o(" / ")]),_:1}),t(_,null,{default:e(()=>[t(c,{to:"/cc-roles"},{default:e(()=>[o(" Control Center Roles ")]),_:1})]),_:1})]),_:1})]),_:1}),t(r,{cols:"12"},{default:e(()=>[t(k,{title:"Control Center Roles"},{default:e(()=>[t(f,null,{default:e(()=>[t(p,null,{default:e(()=>[t(r,{cols:"12",md:"6"},{default:e(()=>[o(" List of all control center roles declared in the ESE database. ")]),_:1}),t(r,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[t(w,{variant:"outlined",size:"small",to:"/cc-roles-add"},{default:e(()=>[o(" New Control center role ")]),_:1})]),_:1})]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(C,{"theme-color":"#ffc000","table-class-name":"customize-table","buttons-pagination":"",headers:n.headers,items:n.items,loading:n.loading,"sort-by":"id"},{loading:e(()=>[z]),"item-created_at":e(({created_at:l})=>[i("div",null,h(s.formatDate(l)),1)]),"item-updated_at":e(({updated_at:l})=>[i("div",null,h(s.formatDate(l)),1)]),"item-operation":e(l=>[i("div",E,[t(d,{size:"20",icon:"mdi-eye",onClick:v=>s.viewItem(l),color:"success"},null,8,["onClick"]),t(B,{vertical:"",class:"ms-2",inset:""}),t(d,{size:"20",icon:"mdi-delete-outline",onClick:v=>s.deleteItem(l),color:"error"},null,8,["onClick"])])]),_:1},8,["headers","items","loading"])]),_:1})]),_:1})]),_:1})]),_:1})}const q=g(R,[["render",N]]);export{q as default};
