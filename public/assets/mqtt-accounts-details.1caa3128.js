import{D as N,m as R,n as O,r as Y,o as r,p as _,w as e,g as t,q as o,s as W,v as V,x as D,k as l,y as S,z as k,be as I,b7 as M,A as v,B as f,t as b,l as y,e as p,a5 as q,aB as T,aC as z,aD as E,f as h,aA as A,ay as w,az as P,ar as u}from"./index.40a940c5.js";import{t as m}from"./form.35e1d7cc.js";/* empty css              */import{h as L}from"./moment.9709ab41.js";import{V as F,a as U,b as j,c as Q}from"./VWindowItem.7affe22a.js";import{V as x}from"./VDialog.7c0c4342.js";import{V as d}from"./VChip.dddc5b41.js";import{V as B}from"./VSelect.98776228.js";import"./VSelectionControl.a61002df.js";import"./VTextField.1b52f8bd.js";const H={name:"DetailsMQTTAccounts",data(){return{currentTab:N("Roles"),item:{},roles:[],addRole:!1,deleteRole:!1,selectedRole:{name:""},selectedRoleToDelete:{},permissions:[],addPermission:!1,deletePermission:!1,selectedPermission:{topic:""},selectedPermissionToDelete:{}}},methods:{formatDate(n){if(n)return L(String(n)).format("MM/DD/YYYY hh:mm")},async update(){this.item.username&&this.item.password?await this.$axios.put("/api/user/"+this.$route.query.id,this.item).then(()=>{m("Accounts successfully updated",{type:"success",position:"bottom-center"})}).then(()=>{this.item={},R.push("/mqtt-users")}).catch(()=>{m("Error updating accounts, contact your admin ! ",{type:"warning",position:"bottom-center"})}):m("Please fill all fields !",{type:"warning",position:"bottom-center"})},cancel(){R.push("/mqtt-accounts")},edit(){R.push("/mqtt-accounts-edit?id="+this.$route.query.id+"&return=details")},deleteUser(){R.push("/mqtt-accounts-delete?id="+this.$route.query.id)},async loadRoles(){this.addRole=!0,await this.$axios.get("/api/roles").then(n=>{this.roles=n.data}).catch(n=>{m("Error loading roles, contact your admin ! Details : "+n.message,{type:"warning",position:"bottom-center"})})},async assignRole(){if(this.selectedRole.id!=null){let n={user_id:this.$route.query.id,role_id:this.selectedRole.id};await this.$axios.post("/api/user_role",n).then(s=>{m("Role assigned successfully",{type:"success",position:"bottom-center"}),this.addRole=!1}).then(async()=>{this.selectedRole={name:""},await this.$axios.get("/api/user/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{m("Error assigning role, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{m("Error updating accounts, contact your admin ! ",{type:"warning",position:"bottom-center"})})}else m("Please fill all fields !",{type:"warning",position:"bottom-center"})},deleteRoleWarning(n){this.deleteRole=!0,this.selectedRoleToDelete=n},async deleteRoleAssignment(){await this.$axios.delete("/api/user_role/"+this.$route.query.id+"/"+this.selectedRoleToDelete.id).then(()=>{m("Role unassigned successfully",{type:"success",position:"bottom-center"}),this.deleteRole=!1}).then(async()=>{this.selectedRoleToDelete={name:""},await this.$axios.get("/api/user/"+this.$route.query.id+"?extend=true").then(n=>{this.item=n.data[0]}).catch(n=>{m("Error deleting role assignment, contact your admin ! Details : "+n.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{m("Error unassigning role to accounts, contact your admin ! ",{type:"warning",position:"bottom-center"})})},async deletePermissionAssignment(){await this.$axios.delete("/api/user_permission/"+this.$route.query.id+"/"+this.selectedPermissionToDelete.id).then(()=>{m("Accounts permission unassigned successfully",{type:"success",position:"bottom-center"}),this.deletePermission=!1}).then(async()=>{this.selectedPermissionToDelete={topic:""},await this.$axios.get("/api/user/"+this.$route.query.id+"?extend=true").then(n=>{this.item=n.data[0]}).catch(n=>{m("Error deleting permission, contact your admin ! Details : "+n.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{m("Error unassigning accounts permission to user, contact your admin ! ",{type:"warning",position:"bottom-center"})})},async assignPermission(){if(this.selectedPermission.id!=null){let n={user_id:this.$route.query.id,permission:this.selectedPermission.id};await this.$axios.post("/api/user_permission",n).then(s=>{m("Accounts permission assigned successfully",{type:"success",position:"bottom-center"}),this.addPermission=!1}).then(async()=>{this.selectedPermission={topic:""},await this.$axios.get("/api/user/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{m("Error assigning permission, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}).catch(()=>{m("Error updating accounts user, contact your admin ! ",{type:"warning",position:"bottom-center"})})}else m("Please fill all fields !",{type:"warning",position:"bottom-center"})},deletePermissionWarning(n){this.deletePermission=!0,this.selectedPermissionToDelete=n},async loadPermissions(){this.addPermission=!0,await this.$axios.get("/api/permissions").then(n=>{this.permissions=n.data}).catch(n=>{m("Error loading permissions, contact your admin ! Details : "+n.message,{type:"warning",position:"bottom-center"})})}},async mounted(){await this.$axios.get("/api/user/"+this.$route.query.id+"?extend=true").then(n=>{this.item=n.data[0]}).catch(n=>{m("Error loading the page, contact your admin ! Details : "+n.message,{type:"warning",position:"bottom-center"})})}},G=h("b",null,"Username ",-1),J=h("b",null,"Password ",-1),K=h("b",null,"Algorithm ",-1),X=h("b",null,"Iterations ",-1),Z=h("b",null,"Created ",-1),$=h("b",null,"Last updated ",-1),ee=h("b",null,"Topic",-1),te=h("b",null,"Pub",-1),le=h("b",null,"Sub",-1),se=h("b",null,"QOS 0",-1),oe=h("b",null,"QOS 1",-1),ie=h("b",null,"QOS 2",-1),ae=h("b",null,"Retain",-1),re=h("b",null,"Shared",-1),ne={key:0},ue={key:1},de={key:0},ce={key:1},me={key:0},_e={key:1},fe={key:0},pe={key:1},he={key:0},ye={key:1},ge={key:0},be={key:1},we={key:0},ke={key:1};function ve(n,s,Ve,Re,a,g){const C=Y("RouterLink");return r(),_(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(W,null,{prepend:e(()=>[t(V,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(D,null,{default:e(()=>[t(C,{to:"/"},{default:e(()=>[l("Home")]),_:1})]),_:1}),t(S,null,{default:e(()=>[l(" / ")]),_:1}),t(D,null,{default:e(()=>[t(C,{to:"/mqtt-accounts"},{default:e(()=>[l(" MQTT Accounts ")]),_:1})]),_:1}),t(S,null,{default:e(()=>[l(" / ")]),_:1}),t(D,null,{default:e(()=>[t(C,{to:"/mqtt-accounts-details?id"+n.$route.query.id},{default:e(()=>[l(" User Details ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(o,{cols:"4"},{default:e(()=>[t(k,{title:"MQTT Account details"},{default:e(()=>[t(I,{class:"text-center"},{default:e(()=>[t(M,{color:"primary",icon:"mdi-devices",size:"x-large"})]),_:1}),t(v,null,{default:e(()=>[t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[G]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(b(a.item.username),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[J]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(" ****************** ")]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[K]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(b(a.item.algorithm),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[X]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(b(a.item.password_iterations),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[Z]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(b(g.formatDate(a.item.created_at)),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[$]),_:1}),t(o,{cols:"12",md:"8",class:"text-right"},{default:e(()=>[l(b(g.formatDate(a.item.updated_at)),1)]),_:1})]),_:1})]),_:1}),t(v,null,{default:e(()=>[t(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(y,{color:"secondary",variant:"tonal",onClick:g.cancel,block:""},{default:e(()=>[l(" Back to role list ")]),_:1},8,["onClick"])]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(y,{color:"primary",variant:"tonal",onClick:g.edit,block:""},{default:e(()=>[l(" Edit user properties ")]),_:1},8,["onClick"])]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(y,{color:"error",variant:"tonal",onClick:g.deleteUser,block:""},{default:e(()=>[l(" Delete user ")]),_:1},8,["onClick"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),t(o,{cols:"8"},{default:e(()=>[t(F,{"align-tabs":"center",modelValue:a.currentTab,"onUpdate:modelValue":s[0]||(s[0]=i=>a.currentTab=i),grow:""},{default:e(()=>[t(U,{value:"Roles"},{default:e(()=>[t(V,{icon:"mdi-key-link"}),l(" Assigned Roles ")]),_:1}),t(U,{value:"Permissions"},{default:e(()=>[t(V,{icon:"mdi-key"}),l(" Direct permissions ")]),_:1})]),_:1},8,["modelValue"]),t(j,{modelValue:a.currentTab,"onUpdate:modelValue":s[15]||(s[15]=i=>a.currentTab=i),class:"mt-5"},{default:e(()=>[t(Q,{value:"Roles"},{default:e(()=>[t(k,null,{default:e(()=>[(r(!0),p(q,null,T(a.item.user_roles,i=>(r(),_(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(v,null,{default:e(()=>[t(z,null,{default:e(()=>[t(E,{style:{"margin-left":"10px"}},{default:e(()=>[h("b",null,b(i.roles.name.toUpperCase()),1),l(" ("+b(i.roles.description)+") ",1)]),_:2},1024),t(A),t(y,{icon:"",color:"#F05635"},{default:e(()=>[t(V,{onClick:c=>g.deleteRoleWarning(i.roles)},{default:e(()=>[l("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),t(x,{modelValue:a.deleteRole,"onUpdate:modelValue":s[3]||(s[3]=c=>a.deleteRole=c),width:"auto"},{default:e(()=>[t(k,null,{default:e(()=>[t(w,null,{default:e(()=>[l(" Are you sure that you want to remove the assignment of "+b(a.selectedRoleToDelete.name)+" ? ",1)]),_:1}),t(P,null,{default:e(()=>[t(y,{color:"alert",onClick:s[1]||(s[1]=c=>g.deleteRoleAssignment())},{default:e(()=>[l("Remove role")]),_:1}),t(y,{color:"secondary",onClick:s[2]||(s[2]=c=>{a.deleteRole=!1,a.selectedRoleToDelete={}})},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024),t(w,null,{default:e(()=>[t(f,null,{default:e(()=>[t(o,{cols:"12",md:"4"},{default:e(()=>[ee]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[te]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[le]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[se]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[oe]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[ie]),_:1}),t(o,{cols:"12",md:"1"},{default:e(()=>[ae]),_:1}),t(o,{cols:"12",md:"2"},{default:e(()=>[re]),_:1})]),_:1})]),_:1}),(r(!0),p(q,null,T(i.roles.role_permissions,c=>(r(),_(w,null,{default:e(()=>[t(f,null,{default:e(()=>[t(A),t(o,{cols:"12",md:"4"},{default:e(()=>[l(b(c.permissions.topic),1)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.publish_allowed==!0?(r(),p("div",ne,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Pub ")]),_:1})])):u("",!0),c.permissions.publish_allowed==!1?(r(),p("div",ue,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" Pub ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.subscribe_allowed==!0?(r(),p("div",de,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Sub ")]),_:1})])):u("",!0),c.permissions.subscribe_allowed==!1?(r(),p("div",ce,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" Sub ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.qos_0_allowed==!0?(r(),p("div",me,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Yes ")]),_:1})])):u("",!0),c.permissions.qos_0_allowed==!1?(r(),p("div",_e,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" No ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.qos_1_allowed==!0?(r(),p("div",fe,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Yes ")]),_:1})])):u("",!0),c.permissions.qos_1_allowed==!1?(r(),p("div",pe,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" No ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.qos_2_allowed==!0?(r(),p("div",he,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Yes ")]),_:1})])):u("",!0),c.permissions.qos_2_allowed==!1?(r(),p("div",ye,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" No ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"1"},{default:e(()=>[c.permissions.retained_msgs_allowed==!0?(r(),p("div",ge,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Yes ")]),_:1})])):u("",!0),c.permissions.retained_msgs_allowed==!1?(r(),p("div",be,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" No ")]),_:1})])):u("",!0)]),_:2},1024),t(o,{cols:"12",md:"2"},{default:e(()=>[c.permissions.shared_sub_allowed==!0?(r(),p("div",we,[t(d,{color:"success",size:"small"},{default:e(()=>[l(" Yes ")]),_:1})])):u("",!0),c.permissions.shared_sub_allowed==!1?(r(),p("div",ke,[t(d,{color:"error",size:"small"},{default:e(()=>[l(" No ")]),_:1})])):u("",!0)]),_:2},1024)]),_:2},1024)]),_:2},1024))),256))]),_:2},1024)]),_:2},1024))),256)),t(f,null,{default:e(()=>[t(o,null,{default:e(()=>[t(v,null,{default:e(()=>[t(y,{variant:"outlined",size:"small",onClick:s[4]||(s[4]=i=>g.loadRoles())},{default:e(()=>[l(" Assign new role ")]),_:1}),t(x,{modelValue:a.addRole,"onUpdate:modelValue":s[7]||(s[7]=i=>a.addRole=i),width:"auto"},{default:e(()=>[t(k,null,{default:e(()=>[t(w,null,{default:e(()=>[l(" Pick the role to assign to user ")]),_:1}),t(w,null,{default:e(()=>[t(B,{modelValue:a.selectedRole,"onUpdate:modelValue":s[5]||(s[5]=i=>a.selectedRole=i),items:a.roles,"item-title":"name","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`${a.selectedRole.description}`},null,8,["modelValue","items","hint"])]),_:1}),t(P,null,{default:e(()=>[t(y,{color:"primary",onClick:g.assignRole},{default:e(()=>[l("Assign role")]),_:1},8,["onClick"]),t(y,{color:"secondary",onClick:s[6]||(s[6]=i=>a.addRole=!1)},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),t(Q,{value:"Permissions"},{default:e(()=>[t(k,{style:{"margin-top":"10px"}},{default:e(()=>[(r(!0),p(q,null,T(a.item.user_permissions,i=>(r(),_(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[t(v,null,{default:e(()=>[t(z,null,{default:e(()=>[t(E,{style:{"margin-left":"10px"}},{default:e(()=>[h("b",null,b(i.permissions.topic.toUpperCase()),1)]),_:2},1024),t(A),t(y,{icon:"",color:"#F05635"},{default:e(()=>[t(V,{onClick:c=>g.deletePermissionWarning(i.permissions)},{default:e(()=>[l("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),t(x,{modelValue:a.deletePermission,"onUpdate:modelValue":s[10]||(s[10]=c=>a.deletePermission=c),width:"auto"},{default:e(()=>[t(k,null,{default:e(()=>[t(w,null,{default:e(()=>[l(" Are you sure that you want to remove the permission : "+b(a.selectedPermissionToDelete.topic)+" ? ",1)]),_:1}),t(P,null,{default:e(()=>[t(y,{color:"alert",onClick:s[8]||(s[8]=c=>g.deletePermissionAssignment())},{default:e(()=>[l("Remove role")]),_:1}),t(y,{color:"secondary",onClick:s[9]||(s[9]=c=>{a.deletePermission=!1,a.selectedPermissionToDelete={}})},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024),t(w,null,{default:e(()=>[t(f,null,{default:e(()=>[t(o,{cols:"12",md:"12"},{default:e(()=>[i.permissions.publish_allowed==!0?(r(),_(d,{key:0,variant:"outlined",pill:"",color:"success"},{default:e(()=>[l(" Publish ")]),_:1})):u("",!0),i.permissions.publish_allowed==!1?(r(),_(d,{key:1,variant:"outlined",pill:"",color:"error"},{default:e(()=>[l(" Publish ")]),_:1})):u("",!0),i.permissions.subscribe_allowed==!0?(r(),_(d,{key:2,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Subscribe ")]),_:1})):u("",!0),i.permissions.subscribe_allowed==!1?(r(),_(d,{key:3,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Subscribe ")]),_:1})):u("",!0),i.permissions.retained_msgs_allowed==!0?(r(),_(d,{key:4,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Retain ")]),_:1})):u("",!0),i.permissions.retained_msgs_allowed==!1?(r(),_(d,{key:5,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Retain ")]),_:1})):u("",!0),i.permissions.qos_0_allowed==!0?(r(),_(d,{key:6,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 0 ")]),_:1})):u("",!0),i.permissions.qos_0_allowed==!1?(r(),_(d,{key:7,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 0 ")]),_:1})):u("",!0),i.permissions.qos_1_allowed==!0?(r(),_(d,{key:8,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 1 ")]),_:1})):u("",!0),i.permissions.qos_1_allowed==!1?(r(),_(d,{key:9,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 1 ")]),_:1})):u("",!0),i.permissions.qos_2_allowed==!0?(r(),_(d,{key:10,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 2 ")]),_:1})):u("",!0),i.permissions.qos_2_allowed==!1?(r(),_(d,{key:11,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 2 ")]),_:1})):u("",!0),i.permissions.shared_sub_allowed==!0?(r(),_(d,{key:12,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Shared ")]),_:1})):u("",!0),i.permissions.shared_sub_allowed==!1?(r(),_(d,{key:13,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Shared ")]),_:1})):u("",!0)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024))),256)),t(f,null,{default:e(()=>[t(o,null,{default:e(()=>[t(v,null,{default:e(()=>[t(y,{variant:"outlined",size:"small",onClick:s[11]||(s[11]=i=>g.loadPermissions())},{default:e(()=>[l(" Assign new permission ")]),_:1}),t(x,{modelValue:a.addPermission,"onUpdate:modelValue":s[14]||(s[14]=i=>a.addPermission=i),width:"auto"},{default:e(()=>[t(k,null,{default:e(()=>[t(w,null,{default:e(()=>[l(" Pick the permission to assign to role ")]),_:1}),t(w,null,{default:e(()=>[t(B,{modelValue:a.selectedPermission,"onUpdate:modelValue":s[12]||(s[12]=i=>a.selectedPermission=i),items:a.permissions,"item-title":"topic","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`Publish : ${a.selectedPermission.publish_allowed} - Subscribe : ${a.selectedPermission.subscribe_allowed}`},null,8,["modelValue","items","hint"])]),_:1}),t(P,null,{default:e(()=>[t(y,{color:"primary",onClick:g.assignPermission},{default:e(()=>[l("Assign permission")]),_:1},8,["onClick"]),t(y,{color:"secondary",onClick:s[13]||(s[13]=i=>a.addPermission=!1)},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})}const Ue=O(H,[["render",ve]]);export{Ue as default};
