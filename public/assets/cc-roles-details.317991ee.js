import{m as y,n as B,r as R,o as C,p as b,w as t,g as e,q as n,s as q,v as w,x as P,k as l,y as x,z as _,A as V,B as d,t as m,az as D,l as u,aA as k,e as A,a5 as T,aB as E,aC as z,aD as L,f as p,ay as h}from"./index.40a940c5.js";import{t as c}from"./form.35e1d7cc.js";/* empty css              */import{h as N}from"./moment.9709ab41.js";import{V as v}from"./VDialog.7c0c4342.js";import{V as S}from"./VSelect.98776228.js";import"./VSelectionControl.a61002df.js";import"./VTextField.1b52f8bd.js";import"./VChip.dddc5b41.js";const U={name:"DetailsCCRoles",data(){return{item:{},permissions:[],addPermission:!1,deletePermission:!1,selectedPermission:{permission_string:""},selectedPermissionToDelete:{}}},methods:{formatDate(s){if(s)return N(String(s)).format("MM/DD/YYYY hh:mm")},cancel(){y.push("/cc-roles")},edit(){y.push("/cc-roles-edit?id="+this.$route.query.id+"&return=details")},deleteRole(){y.push("/cc-roles-delete?id="+this.$route.query.id)},async loadPermissions(){this.addPermission=!0,await this.$axios.get("/api/cc_permissions").then(s=>{this.permissions=s.data}).catch(s=>{c("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})},async assignPermission(){if(this.selectedPermission.id!=null){let s={role:this.$route.query.id,permission:this.selectedPermission.id};await this.$axios.post("/api/cc_role_permission",s).then(i=>{c("Control panel permission assigned successfully",{type:"success",position:"bottom-center"}),this.addPermission=!1}).then(async()=>{this.selectedPermission={permission_string:""},await this.$axios.get("/api/cc_role/"+this.$route.query.id+"?extend=true").then(i=>{this.item=i.data[0]}).catch(i=>{c("Error loading the page, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{c("Error updating control panel role, contact your admin ! ",{type:"warning",position:"bottom-center"})})}else c("Please fill all fields !",{type:"warning",position:"bottom-center"})},deleteWarning(s){this.deletePermission=!0,this.selectedPermissionToDelete=s},async deleteAssignment(){await this.$axios.delete("/api/cc_role_permission/"+this.$route.query.id+"/"+this.selectedPermissionToDelete.id).then(s=>{c("Control panel permission unassigned successfully",{type:"success",position:"bottom-center"}),this.deletePermission=!1}).then(async()=>{this.selectedPermissionToDelete={permission_string:""},await this.$axios.get("/api/cc_role/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{c("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{c("Error unassigning permission to control panel role, contact your admin ! ",{type:"warning",position:"bottom-center"})})}},async mounted(){await this.$axios.get("/api/cc_role/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{c("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}},Y=p("b",null,"Name ",-1),I=p("b",null,"Description ",-1),F=p("b",null,"Created ",-1),M=p("b",null,"Last updated ",-1);function W(s,i,j,H,o,r){const g=R("RouterLink");return C(),b(d,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(q,null,{prepend:t(()=>[e(w,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(P,null,{default:t(()=>[e(g,{to:"/"},{default:t(()=>[l("Home")]),_:1})]),_:1}),e(x,null,{default:t(()=>[l(" / ")]),_:1}),e(P,null,{default:t(()=>[e(g,{to:"/cc-roles"},{default:t(()=>[l(" Control Center Roles ")]),_:1})]),_:1}),e(x,null,{default:t(()=>[l(" / ")]),_:1}),e(P,null,{default:t(()=>[e(g,{to:"/cc-roles-details?id"+s.$route.query.id},{default:t(()=>[l(" Role Details ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(n,{cols:"12"},{default:t(()=>[e(_,{title:"Control center role details"},{default:t(()=>[e(V,null,{default:t(()=>[e(d,{style:{"margin-top":"2px"}},{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[e(d,null,{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[Y]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[l(m(o.item.name),1)]),_:1})]),_:1}),e(d,null,{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[I]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[l(m(o.item.description),1)]),_:1})]),_:1})]),_:1}),e(n,{cols:"12",md:"6"},{default:t(()=>[e(d,null,{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[F]),_:1}),e(n,{cols:"12",md:"6",class:"text-right"},{default:t(()=>[l(m(r.formatDate(o.item.created_at)),1)]),_:1})]),_:1}),e(d,null,{default:t(()=>[e(n,{cols:"12",md:"6"},{default:t(()=>[M]),_:1}),e(n,{cols:"12",md:"6",class:"text-right"},{default:t(()=>[l(m(r.formatDate(o.item.updated_at)),1)]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),e(D,null,{default:t(()=>[e(u,{color:"secondary",variant:"tonal",onClick:r.cancel},{default:t(()=>[l(" Back to role list ")]),_:1},8,["onClick"]),e(k,{class:"border-opacity-0"}),e(u,{color:"primary",variant:"tonal",onClick:r.edit},{default:t(()=>[l(" Edit role properties ")]),_:1},8,["onClick"]),e(k,{class:"border-opacity-0"}),e(u,{color:"error",variant:"tonal",onClick:r.deleteRole},{default:t(()=>[l(" Delete role ")]),_:1},8,["onClick"])]),_:1})]),_:1}),e(_,{title:"Assigned permissions",style:{"margin-top":"10px"}},{default:t(()=>[(C(!0),A(T,null,E(o.item.cc_role_permissions,a=>(C(),b(d,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(V,null,{default:t(()=>[e(z,null,{default:t(()=>[e(L,{style:{"margin-left":"10px"}},{default:t(()=>[p("b",null,m(a.cc_permissions.permission_string.toUpperCase()),1)]),_:2},1024),e(k),e(u,{icon:"",color:"#F05635"},{default:t(()=>[e(w,{onClick:f=>r.deleteWarning(a.cc_permissions)},{default:t(()=>[l("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),e(v,{modelValue:o.deletePermission,"onUpdate:modelValue":i[2]||(i[2]=f=>o.deletePermission=f),width:"auto"},{default:t(()=>[e(_,null,{default:t(()=>[e(h,null,{default:t(()=>[l(" Are you sure that you want to remove the permission : "+m(o.selectedPermissionToDelete.permission_string)+" ? ",1)]),_:1}),e(D,null,{default:t(()=>[e(u,{color:"alert",onClick:i[0]||(i[0]=f=>r.deleteAssignment())},{default:t(()=>[l("Remove role")]),_:1}),e(u,{color:"secondary",onClick:i[1]||(i[1]=f=>{o.deletePermission=!1,o.selectedPermissionToDelete={}})},{default:t(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024),e(h,null,{default:t(()=>[e(d,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[p("i",null,m(a.cc_permissions.description),1)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024))),256)),e(d,null,{default:t(()=>[e(n,null,{default:t(()=>[e(V,null,{default:t(()=>[e(u,{variant:"outlined",size:"small",onClick:i[3]||(i[3]=a=>r.loadPermissions())},{default:t(()=>[l(" Assign new permission ")]),_:1}),e(v,{modelValue:o.addPermission,"onUpdate:modelValue":i[6]||(i[6]=a=>o.addPermission=a),width:"auto"},{default:t(()=>[e(_,null,{default:t(()=>[e(h,null,{default:t(()=>[l(" Pick the permission to assign to role ")]),_:1}),e(h,null,{default:t(()=>[e(S,{modelValue:o.selectedPermission,"onUpdate:modelValue":i[4]||(i[4]=a=>o.selectedPermission=a),items:o.permissions,"item-title":"permission_string","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`Description : ${o.selectedPermission.description}`},null,8,["modelValue","items","hint"])]),_:1}),e(D,null,{default:t(()=>[e(u,{color:"primary",onClick:r.assignPermission},{default:t(()=>[l("Assign permission")]),_:1},8,["onClick"]),e(u,{color:"secondary",onClick:i[5]||(i[5]=a=>o.addPermission=!1)},{default:t(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const te=B(U,[["render",W]]);export{te as default};
