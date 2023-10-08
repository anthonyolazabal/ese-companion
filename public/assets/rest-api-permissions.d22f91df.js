import{n as c,p as k,r as p,o as n,q as C,w as e,i as t,s as r,v as y,x as d,y as _,l as i,z as B,A as D,B as f,C as h,m as I,f as m,t as g,e as V,ar as b}from"./index.551e53aa.js";import{h as w}from"./moment.9709ab41.js";import{_ as E}from"./loading-bee.8d7bf3b7.js";const R={name:"RestApiPermissions",data(){return{headers:[{text:"Permission",value:"permission_string",sortable:!0},{text:"Description",value:"description"},{text:"Created",value:"created_at",sortable:!0},{text:"Last Updated",value:"updated_at",sortable:!0},{text:"Operations",value:"operation"}],itemsSelected:[],items:[],loading:!0,isEditing:!1,editingItem:null}},methods:{formatDate(s){if(s)return w(String(s)).format("MM/DD/YYYY hh:mm")},deleteItem(s){c.push("/rest-api-permissions-delete?id="+s.id)},editItem:function(s){c.push("/rest-api-permissions-edit?id="+s.id)}},async mounted(){await this.$axios.get("/api/rest_api_permissions").then(s=>{this.items=s.data,this.loading=!1}).catch(s=>{console.log(s)})}},z=m("img",{src:E,style:{width:"6.25rem",height:"6.25rem"},alt:"Bee"},null,-1),A={key:0,class:"operation-wrapper"},N={key:1,class:"operation-wrapper"};function P(s,L,M,S,l,o){const u=p("RouterLink"),v=p("EasyDataTable");return n(),C(h,null,{default:e(()=>[t(r,{cols:"12",md:"12"},{default:e(()=>[t(y,null,{prepend:e(()=>[t(d,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(_,null,{default:e(()=>[t(u,{to:"/"},{default:e(()=>[i("Home")]),_:1})]),_:1}),t(B,null,{default:e(()=>[i(" / ")]),_:1}),t(_,null,{default:e(()=>[t(u,{to:"/rest-api-permissions"},{default:e(()=>[i(" Rest Api Permissions ")]),_:1})]),_:1})]),_:1})]),_:1}),t(r,{cols:"12"},{default:e(()=>[t(D,{title:"Rest Api Permissions"},{default:e(()=>[t(f,null,{default:e(()=>[t(h,null,{default:e(()=>[t(r,{cols:"12",md:"6"},{default:e(()=>[i(" List of all rest api permissions declared in the ESE database. ")]),_:1}),t(r,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[t(I,{variant:"outlined",size:"small",to:"/rest-api-permissions-add"},{default:e(()=>[i(" New Rest Api permission ")]),_:1})]),_:1})]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(v,{"theme-color":"#ffc000","table-class-name":"customize-table","buttons-pagination":"",headers:l.headers,items:l.items,loading:l.loading,"sort-by":"id"},{loading:e(()=>[z]),"item-created_at":e(({created_at:a})=>[m("div",null,g(o.formatDate(a)),1)]),"item-updated_at":e(({updated_at:a})=>[m("div",null,g(o.formatDate(a)),1)]),"item-operation":e(a=>[a.permission_string.startsWith("HIVEMQ_")!=!0?(n(),V("div",A,[t(d,{size:"20",icon:"mdi-playlist-edit",onClick:x=>o.editItem(a),color:"secondary"},null,8,["onClick"]),t(d,{size:"20",icon:"mdi-delete-outline",onClick:x=>o.deleteItem(a),color:"error"},null,8,["onClick"])])):b("",!0),a.permission_string.startsWith("HIVEMQ_")==!0?(n(),V("div",N," Not editable ")):b("",!0)]),_:1},8,["headers","items","loading"])]),_:1})]),_:1})]),_:1})]),_:1})}const Q=k(R,[["render",P]]);export{Q as default};
