import{m as u,n as k,r as _,o as n,p as x,w as e,g as t,q as r,s as y,v as d,x as p,k as o,y as D,z as I,A as f,B as h,l as B,f as c,t as g,e as C,ar as V}from"./index.40a940c5.js";import{h as w}from"./moment.9709ab41.js";import{_ as E}from"./database-table.c92fc6be.js";const z={name:"CCPermissions",data(){return{headers:[{text:"Permission",value:"permission_string",sortable:!0},{text:"Description",value:"description"},{text:"Created",value:"created_at",sortable:!0},{text:"Last Updated",value:"updated_at",sortable:!0},{text:"Operations",value:"operation"}],itemsSelected:[],items:[],loading:!0,isEditing:!1,editingItem:null}},methods:{formatDate(s){if(s)return w(String(s)).format("MM/DD/YYYY hh:mm")},deleteItem(s){u.push("/cc-permissions-delete?id="+s.id)},editItem:function(s){u.push("/cc-permissions-edit?id="+s.id)}},async mounted(){await this.$axios.get("/api/cc_permissions").then(s=>{this.items=s.data,this.loading=!1}).catch(s=>{console.log(s)})}},N=c("img",{src:E,style:{width:"6.25rem",height:"6.25rem"},alt:"loader"},null,-1),P={key:0,class:"operation-wrapper"},L={key:1,class:"operation-wrapper"};function M(s,S,Y,H,l,i){const m=_("RouterLink"),b=_("EasyDataTable");return n(),x(h,null,{default:e(()=>[t(r,{cols:"12",md:"12"},{default:e(()=>[t(y,null,{prepend:e(()=>[t(d,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(p,null,{default:e(()=>[t(m,{to:"/"},{default:e(()=>[o("Home")]),_:1})]),_:1}),t(D,null,{default:e(()=>[o(" / ")]),_:1}),t(p,null,{default:e(()=>[t(m,{to:"/cc-permissions"},{default:e(()=>[o(" Control Center Permissions ")]),_:1})]),_:1})]),_:1})]),_:1}),t(r,{cols:"12"},{default:e(()=>[t(I,{title:"Control Center Permissions"},{default:e(()=>[t(f,null,{default:e(()=>[t(h,null,{default:e(()=>[t(r,{cols:"12",md:"6"},{default:e(()=>[o(" List of all control center permissions declared in the ESE database. ")]),_:1}),t(r,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[t(B,{variant:"outlined",size:"small",to:"/cc-permissions-add"},{default:e(()=>[o(" New control center permission ")]),_:1})]),_:1})]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(b,{"theme-color":"#ffc000","table-class-name":"customize-table","buttons-pagination":"",headers:l.headers,items:l.items,loading:l.loading,"sort-by":"id"},{loading:e(()=>[N]),"item-created_at":e(({created_at:a})=>[c("div",null,g(i.formatDate(a)),1)]),"item-updated_at":e(({updated_at:a})=>[c("div",null,g(i.formatDate(a)),1)]),"item-operation":e(a=>[a.permission_string.startsWith("HIVEMQ_")!=!0?(n(),C("div",P,[t(d,{size:"20",icon:"mdi-playlist-edit",onClick:v=>i.editItem(a),color:"secondary"},null,8,["onClick"]),t(d,{size:"20",icon:"mdi-delete-outline",onClick:v=>i.deleteItem(a),color:"error"},null,8,["onClick"])])):V("",!0),a.permission_string.startsWith("HIVEMQ_")==!0?(n(),C("div",L," Not editable ")):V("",!0)]),_:1},8,["headers","items","loading"])]),_:1})]),_:1})]),_:1})]),_:1})}const W=k(z,[["render",M]]);export{W as default};
