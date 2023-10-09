import{D as W,m as b,n as I,r as S,o as h,p as C,w as t,g as e,q as n,s as Y,v as V,x as k,k as s,y as U,z as g,be as F,b7 as L,A as y,B as u,t as m,l as d,e as D,a5 as x,aB as v,aC as q,aD as A,f as p,aA as T,ay as _,az as w}from"./index.998ab70e.js";import{t as a}from"./form.77a082ea.js";/* empty css              */import{h as N}from"./moment.9709ab41.js";import{V as j,a as E,b as M,c as B}from"./VWindowItem.2df91e70.js";import{V as R}from"./VDialog.a28bbb96.js";import{V as z}from"./VSelect.f852e1e4.js";import"./VSelectionControl.06cd081e.js";import"./VTextField.16466e2b.js";import"./VChip.3c763cc4.js";const H={name:"DetailsCCUsers",data(){return{currentTab:W("Roles"),item:{},roles:[],addRole:!1,deleteRole:!1,selectedRole:{name:""},selectedRoleToDelete:{},permissions:[],addPermission:!1,deletePermission:!1,selectedPermission:{permission_string:""},selectedPermissionToDelete:{}}},methods:{formatDate(i){if(i)return N(String(i)).format("MM/DD/YYYY hh:mm")},async update(){this.item.username&&this.item.password?await this.$axios.put("/api/cc_user/"+this.$route.query.id,this.item).then(()=>{a("Control center user successfully updated",{type:"success",position:"bottom-center"})}).then(()=>{this.item={},b.push("/cc-users")}).catch(()=>{a("Error updating control center user, contact your admin ! ",{type:"warning",position:"bottom-center"})}):a("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){b.push("/cc-users")},edit(){b.push("/cc-users-edit?id="+this.$route.query.id+"&return=details")},deleteUser(){b.push("/cc-users-delete?id="+this.$route.query.id)},async loadRoles(){this.addRole=!0,await this.$axios.get("/api/cc_roles").then(i=>{this.roles=i.data}).catch(i=>{a("Error loading roles, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})},async loadPermissions(){this.addPermission=!0,await this.$axios.get("/api/cc_permissions").then(i=>{this.permissions=i.data}).catch(i=>{a("Error loading permissions, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})},async assignRole(){if(this.selectedRole.id!=null){let i={user_id:this.$route.query.id,role_id:this.selectedRole.id};await this.$axios.post("/api/cc_user_role",i).then(l=>{a("Control center role assigned successfully",{type:"success",position:"bottom-center"}),this.addRole=!1}).then(async()=>{this.selectedRole={name:""},await this.$axios.get("/api/cc_user/"+this.$route.query.id+"?extend=true").then(l=>{this.item=l.data[0]}).catch(l=>{a("Error, contact your admin ! Details : "+l.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{a("Error updating control center user, contact your admin ! ",{type:"warning",position:"bottom-center"})})}else a("Please fill all fields !",{type:"warning",position:"bottom-center"})},async assignPermission(){if(this.selectedPermission.id!=null){let i={user_id:this.$route.query.id,permission:this.selectedPermission.id};await this.$axios.post("/api/cc_user_permission",i).then(l=>{a("Control center permission assigned successfully",{type:"success",position:"bottom-center"}),this.addPermission=!1}).then(async()=>{this.selectedPermission={permission_string:""},await this.$axios.get("/api/cc_user/"+this.$route.query.id+"?extend=true").then(l=>{this.item=l.data[0]}).catch(l=>{a("Error, contact your admin ! Details : "+l.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{a("Error updating control center user, contact your admin ! ",{type:"warning",position:"bottom-center"})})}else a("Please fill all fields !",{type:"warning",position:"bottom-center"})},deleteRoleWarning(i){this.deleteRole=!0,this.selectedRoleToDelete=i},deletePermissionWarning(i){this.deletePermission=!0,this.selectedPermissionToDelete=i},async deleteRoleAssignment(){await this.$axios.delete("/api/cc_user_role/"+this.$route.query.id+"/"+this.selectedRoleToDelete.id).then(()=>{a("Control center role unassigned successfully",{type:"success",position:"bottom-center"}),this.deleteRole=!1}).then(async()=>{this.selectedRoleToDelete={name:""},await this.$axios.get("/api/cc_user/"+this.$route.query.id+"?extend=true").then(i=>{this.item=i.data[0]}).catch(i=>{a("Error, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{a("Error unassigning control center role to user, contact your admin ! ",{type:"warning",position:"bottom-center"})})},async deletePermissionAssignment(){await this.$axios.delete("/api/cc_user_permission/"+this.$route.query.id+"/"+this.selectedPermissionToDelete.id).then(()=>{a("Control center permission unassigned successfully",{type:"success",position:"bottom-center"}),this.deletePermission=!1}).then(async()=>{this.selectedPermissionToDelete={permission_string:""},await this.$axios.get("/api/cc_user/"+this.$route.query.id+"?extend=true").then(i=>{this.item=i.data[0]}).catch(i=>{a("Error, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{a("Error unassigning control center permission to user, contact your admin ! ",{type:"warning",position:"bottom-center"})})}},async mounted(){await this.$axios.get("/api/cc_user/"+this.$route.query.id+"?extend=true").then(i=>{this.item=i.data[0]}).catch(i=>{a("Error loading the page, contact your admin ! Details : "+i.message,{type:"warning",position:"bottom-center"})})}},G=p("b",null,"Username ",-1),J=p("b",null,"Password ",-1),K=p("b",null,"Algorithm ",-1),O=p("b",null,"Iterations ",-1),Q=p("b",null,"Created ",-1),X=p("b",null,"Updated ",-1),Z=p("b",null,"Permission",-1),$=p("b",null,"Description",-1);function ee(i,l,te,le,o,c){const P=S("RouterLink");return h(),C(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(Y,null,{prepend:t(()=>[e(V,{size:"small",icon:"mdi-home"})]),default:t(()=>[e(k,null,{default:t(()=>[e(P,{to:"/"},{default:t(()=>[s("Home")]),_:1})]),_:1}),e(U,null,{default:t(()=>[s(" / ")]),_:1}),e(k,null,{default:t(()=>[e(P,{to:"/cc-users"},{default:t(()=>[s(" Control Center Users ")]),_:1})]),_:1}),e(U,null,{default:t(()=>[s(" / ")]),_:1}),e(k,null,{default:t(()=>[e(P,{to:"/cc-users-details?id"+i.$route.query.id},{default:t(()=>[s(" User Details ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),e(n,{cols:"4"},{default:t(()=>[e(g,{title:"Control Center user details"},{default:t(()=>[e(F,{class:"text-center"},{default:t(()=>[e(L,{color:"primary",icon:"mdi-account",size:"x-large"})]),_:1}),e(y,null,{default:t(()=>[e(u,null,{default:t(()=>[e(n,{cols:"12",md:"5"},{default:t(()=>[G]),_:1}),e(n,{cols:"12",md:"7",class:"text-right"},{default:t(()=>[s(m(o.item.username),1)]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"4"},{default:t(()=>[J]),_:1}),e(n,{cols:"12",md:"8",class:"text-right"},{default:t(()=>[s(" **************** ")]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"5"},{default:t(()=>[K]),_:1}),e(n,{cols:"12",md:"7",class:"text-right"},{default:t(()=>[s(m(o.item.algorithm),1)]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"4"},{default:t(()=>[O]),_:1}),e(n,{cols:"12",md:"8",class:"text-right"},{default:t(()=>[s(m(o.item.password_iterations),1)]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"4"},{default:t(()=>[Q]),_:1}),e(n,{cols:"12",md:"8",class:"text-right"},{default:t(()=>[s(m(c.formatDate(o.item.created_at)),1)]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"4"},{default:t(()=>[X]),_:1}),e(n,{cols:"12",md:"8",class:"text-right"},{default:t(()=>[s(m(c.formatDate(o.item.updated_at)),1)]),_:1})]),_:1})]),_:1}),e(y,null,{default:t(()=>[e(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(d,{color:"secondary",variant:"tonal",onClick:c.cancel,block:""},{default:t(()=>[s(" Back to role list ")]),_:1},8,["onClick"])]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(d,{color:"primary",variant:"tonal",onClick:c.edit,block:""},{default:t(()=>[s(" Edit user properties ")]),_:1},8,["onClick"])]),_:1})]),_:1}),e(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(d,{color:"error",variant:"tonal",onClick:c.deleteUser,block:""},{default:t(()=>[s(" Delete user ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),e(n,{cols:"8"},{default:t(()=>[e(j,{"align-tabs":"center",modelValue:o.currentTab,"onUpdate:modelValue":l[0]||(l[0]=r=>o.currentTab=r),grow:""},{default:t(()=>[e(E,{value:"Roles"},{default:t(()=>[e(V,{icon:"mdi-key-link"}),s(" Assigned Roles ")]),_:1}),e(E,{value:"Permissions"},{default:t(()=>[e(V,{icon:"mdi-key"}),s(" Direct permissions ")]),_:1})]),_:1},8,["modelValue"]),e(M,{modelValue:o.currentTab,"onUpdate:modelValue":l[15]||(l[15]=r=>o.currentTab=r),class:"mt-5"},{default:t(()=>[e(B,{value:"Roles"},{default:t(()=>[e(g,null,{default:t(()=>[(h(!0),D(x,null,v(o.item.cc_user_roles,r=>(h(),C(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(y,null,{default:t(()=>[e(q,null,{default:t(()=>[e(A,{style:{"margin-left":"10px"}},{default:t(()=>[p("b",null,m(r.cc_roles.name.toUpperCase()),1),s(" ("+m(r.cc_roles.description)+") ",1)]),_:2},1024),e(T),e(d,{icon:"",color:"#F05635"},{default:t(()=>[e(V,{onClick:f=>c.deleteRoleWarning(r.cc_roles)},{default:t(()=>[s("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),e(R,{modelValue:o.deleteRole,"onUpdate:modelValue":l[3]||(l[3]=f=>o.deleteRole=f),width:"auto"},{default:t(()=>[e(g,null,{default:t(()=>[e(_,null,{default:t(()=>[s(" Are you sure that you want to remove the assignment of "+m(o.selectedRoleToDelete.name)+" ? ",1)]),_:1}),e(w,null,{default:t(()=>[e(d,{color:"alert",onClick:l[1]||(l[1]=f=>c.deleteRoleAssignment())},{default:t(()=>[s("Remove role")]),_:1}),e(d,{color:"secondary",onClick:l[2]||(l[2]=f=>{o.deleteRole=!1,o.selectedRoleToDelete={}})},{default:t(()=>[s("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024),e(_,null,{default:t(()=>[e(u,null,{default:t(()=>[e(n,{cols:"12",md:"4"},{default:t(()=>[Z]),_:1}),e(n,{cols:"12",md:"8"},{default:t(()=>[$]),_:1})]),_:1})]),_:1}),(h(!0),D(x,null,v(r.cc_roles.cc_role_permissions,f=>(h(),C(_,null,{default:t(()=>[e(u,null,{default:t(()=>[e(T),e(n,{cols:"12",md:"4"},{default:t(()=>[s(m(f.cc_permissions.permission_string),1)]),_:2},1024),e(n,{cols:"12",md:"8"},{default:t(()=>[s(m(f.cc_permissions.description),1)]),_:2},1024)]),_:2},1024)]),_:2},1024))),256))]),_:2},1024)]),_:2},1024))),256)),e(u,null,{default:t(()=>[e(n,null,{default:t(()=>[e(y,null,{default:t(()=>[e(d,{variant:"outlined",size:"small",onClick:l[4]||(l[4]=r=>c.loadRoles())},{default:t(()=>[s(" Assign new control center role ")]),_:1}),e(R,{modelValue:o.addRole,"onUpdate:modelValue":l[7]||(l[7]=r=>o.addRole=r),width:"auto"},{default:t(()=>[e(g,null,{default:t(()=>[e(_,null,{default:t(()=>[s(" Pick the role to assign to user ")]),_:1}),e(_,null,{default:t(()=>[e(z,{modelValue:o.selectedRole,"onUpdate:modelValue":l[5]||(l[5]=r=>o.selectedRole=r),items:o.roles,"item-title":"name","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`${o.selectedRole.description}`},null,8,["modelValue","items","hint"])]),_:1}),e(w,null,{default:t(()=>[e(d,{color:"primary",onClick:c.assignRole},{default:t(()=>[s("Assign role")]),_:1},8,["onClick"]),e(d,{color:"secondary",onClick:l[6]||(l[6]=r=>o.addRole=!1)},{default:t(()=>[s("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),e(B,{value:"Permissions"},{default:t(()=>[e(g,null,{default:t(()=>[(h(!0),D(x,null,v(o.item.cc_user_permissions,r=>(h(),C(u,null,{default:t(()=>[e(n,{cols:"12",md:"12"},{default:t(()=>[e(y,null,{default:t(()=>[e(q,null,{default:t(()=>[e(A,{style:{"margin-left":"10px"}},{default:t(()=>[s(m(r.cc_permissions.permission_string.toUpperCase()),1)]),_:2},1024),e(T),e(d,{icon:"",color:"#F05635"},{default:t(()=>[e(V,{onClick:f=>c.deletePermissionWarning(r.cc_permissions)},{default:t(()=>[s("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),e(_,null,{default:t(()=>[s(m(r.cc_permissions.description),1)]),_:2},1024),e(R,{modelValue:o.deletePermission,"onUpdate:modelValue":l[10]||(l[10]=f=>o.deletePermission=f),width:"auto"},{default:t(()=>[e(g,null,{default:t(()=>[e(_,null,{default:t(()=>[s(" Are you sure that you want to remove the assignment of "+m(o.selectedPermissionToDelete.permission_string)+" ? ",1)]),_:1}),e(w,null,{default:t(()=>[e(d,{color:"alert",onClick:l[8]||(l[8]=f=>c.deletePermissionAssignment())},{default:t(()=>[s("Remove role")]),_:1}),e(d,{color:"secondary",onClick:l[9]||(l[9]=f=>{o.deletePermission=!1,o.selectedPermissionToDelete={}})},{default:t(()=>[s(" Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024)]),_:2},1024)]),_:2},1024))),256)),e(u,null,{default:t(()=>[e(n,null,{default:t(()=>[e(y,null,{default:t(()=>[e(d,{variant:"outlined",size:"small",onClick:l[11]||(l[11]=r=>c.loadPermissions())},{default:t(()=>[s(" Assign new control center permission ")]),_:1}),e(R,{modelValue:o.addPermission,"onUpdate:modelValue":l[14]||(l[14]=r=>o.addPermission=r),width:"auto"},{default:t(()=>[e(g,null,{default:t(()=>[e(_,null,{default:t(()=>[s(" Pick the permission to assign to user ")]),_:1}),e(_,null,{default:t(()=>[e(z,{modelValue:o.selectedPermission,"onUpdate:modelValue":l[12]||(l[12]=r=>o.selectedPermission=r),items:o.permissions,"item-title":"permission_string","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`${o.selectedPermission.description}`},null,8,["modelValue","items","hint"])]),_:1}),e(w,null,{default:t(()=>[e(d,{color:"primary",onClick:c.assignPermission},{default:t(()=>[s("Assign permission")]),_:1},8,["onClick"]),e(d,{color:"secondary",onClick:l[13]||(l[13]=r=>o.addPermission=!1)},{default:t(()=>[s("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})}const fe=I(H,[["render",ee]]);export{fe as default};
