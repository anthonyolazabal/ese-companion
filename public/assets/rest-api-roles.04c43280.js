import{m as c,n as b,r as m,o as x,p as V,w as e,g as t,q as i,s as D,v as n,x as _,k as l,y as k,z as C,A as p,B as f,l as R,f as r,t as h,aA as w}from"./index.40a940c5.js";import{h as y}from"./moment.9709ab41.js";import{_ as B}from"./database-table.c92fc6be.js";const I={name:"RestApiRoles",data(){return{headers:[{text:"Name",value:"name",sortable:!0},{text:"Description",value:"description"},{text:"Created",value:"created_at",sortable:!0},{text:"Last Updated",value:"updated_at",sortable:!0},{text:"Operations",value:"operation"}],itemsSelected:[],items:[],loading:!0,isEditing:!1,editingItem:null}},methods:{formatDate(a){if(a)return y(String(a)).format("MM/DD/YYYY hh:mm")},deleteItem(a){c.push("/rest-api-roles-delete?id="+a.id)},viewItem:function(a){c.push("/rest-api-roles-details?id="+a.id)}},async mounted(){await this.$axios.get("/api/rest_api_roles").then(a=>{this.items=a.data,this.loading=!1}).catch(a=>{console.log(a)})}},z=r("img",{src:B,style:{width:"6.25rem",height:"6.25rem"},alt:"loader"},null,-1),A={class:"operation-wrapper"};function E(a,N,L,S,d,o){const u=m("RouterLink"),g=m("EasyDataTable");return x(),V(f,null,{default:e(()=>[t(i,{cols:"12",md:"12"},{default:e(()=>[t(D,null,{prepend:e(()=>[t(n,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(_,null,{default:e(()=>[t(u,{to:"/"},{default:e(()=>[l("Home")]),_:1})]),_:1}),t(k,null,{default:e(()=>[l(" / ")]),_:1}),t(_,null,{default:e(()=>[t(u,{to:"/rest-api-roles"},{default:e(()=>[l(" Rest Api Roles ")]),_:1})]),_:1})]),_:1})]),_:1}),t(i,{cols:"12"},{default:e(()=>[t(C,{title:"Rest Api Roles"},{default:e(()=>[t(p,null,{default:e(()=>[t(f,null,{default:e(()=>[t(i,{cols:"12",md:"6"},{default:e(()=>[l(" List of all rest api roles declared in the ESE database. ")]),_:1}),t(i,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[t(R,{variant:"outlined",size:"small",to:"/rest-api-roles-add"},{default:e(()=>[l(" New rest api role ")]),_:1})]),_:1})]),_:1})]),_:1}),t(p,null,{default:e(()=>[t(g,{"theme-color":"#ffc000","table-class-name":"customize-table","buttons-pagination":"",headers:d.headers,items:d.items,loading:d.loading,"sort-by":"id"},{loading:e(()=>[z]),"item-created_at":e(({created_at:s})=>[r("div",null,h(o.formatDate(s)),1)]),"item-updated_at":e(({updated_at:s})=>[r("div",null,h(o.formatDate(s)),1)]),"item-operation":e(s=>[r("div",A,[t(n,{size:"20",icon:"mdi-eye",onClick:v=>o.viewItem(s),color:"success"},null,8,["onClick"]),t(w,{vertical:"",class:"ms-2",inset:""}),t(n,{size:"20",icon:"mdi-delete-outline",onClick:v=>o.deleteItem(s),color:"error"},null,8,["onClick"])])]),_:1},8,["headers","items","loading"])]),_:1})]),_:1})]),_:1})]),_:1})}const q=b(I,[["render",E]]);export{q as default};
