import{n as w,p as T,r as R,o as r,q as n,w as e,i as t,s as d,v as B,x as D,y as V,l,z as q,A as b,B as x,C as f,t as y,az as v,m as p,aA as C,e as A,a5 as Q,aB as E,aC as O,aD as M,f as h,ay as P,ar as u}from"./index.551e53aa.js";import{t as _}from"./form.50b7d74e.js";/* empty css              */import{h as N}from"./moment.9709ab41.js";import{V as S}from"./VDialog.e33bdff0.js";import{V as m}from"./VChip.41e4d8f5.js";import{V as z}from"./VSelect.bd1af8f8.js";import"./VSelectionControl.b73cc107.js";import"./VTextField.5d7f987a.js";const L={name:"DetailsMQTTRoles",data(){return{item:{},permissions:[],addPermission:!1,deletePermission:!1,selectedPermission:{topic:""},selectedPermissionToDelete:{}}},methods:{formatDate(s){if(s)return N(String(s)).format("MM/DD/YYYY hh:mm")},cancel(){w.push("/mqtt-roles")},edit(){w.push("/mqtt-roles-edit?id="+this.$route.query.id+"&return=details")},deleteRole(){w.push("/mqtt-roles-delete?id="+this.$route.query.id)},async loadPermissions(){this.addPermission=!0,await this.$axios.get("/api/permissions").then(s=>{this.permissions=s.data}).catch(s=>{_("Error loading permissions, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})},async assignPermission(){if(this.selectedPermission.id!=null){let s={role:this.$route.query.id,permission:this.selectedPermission.id};await this.$axios.post("/api/role_permission",s).then(o=>{_("Permission assigned successfully",{type:"success",position:"bottom-center"}),this.addPermission=!1}).then(async()=>{this.selectedPermission={topic:""},await this.$axios.get("/api/role/"+this.$route.query.id+"?extend=true").then(o=>{this.item=o.data[0]}).catch(o=>{_("Error refreshing the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}).catch(o=>{_("Error loading the page, contact your admin ! Details : "+o.message,{type:"warning",position:"bottom-center"})})}else _("Please fill all fields !",{type:"warning",position:"bottom-center"})},deleteWarning(s){this.deletePermission=!0,this.selectedPermissionToDelete=s},async deleteAssignment(){await this.$axios.delete("/api/role_permission/"+this.$route.query.id+"/"+this.selectedPermissionToDelete.id).then(s=>{_("Permission unassigned successfully",{type:"success",position:"bottom-center"}),this.deletePermission=!1}).then(async()=>{this.selectedPermissionToDelete={topic:""},await this.$axios.get("/api/role/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{_("Error deleting assignment, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}).catch(s=>{_("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}},async mounted(){await this.$axios.get("/api/role/"+this.$route.query.id+"?extend=true").then(s=>{this.item=s.data[0]}).catch(s=>{_("Error loading the page, contact your admin ! Details : "+s.message,{type:"warning",position:"bottom-center"})})}},U=h("b",null,"Name ",-1),Y=h("b",null,"Description ",-1),I=h("b",null,"Created ",-1),F=h("b",null,"Last updated ",-1);function W(s,o,j,H,a,c){const k=R("RouterLink");return r(),n(f,null,{default:e(()=>[t(d,{cols:"12",md:"12"},{default:e(()=>[t(B,null,{prepend:e(()=>[t(D,{size:"small",icon:"mdi-home"})]),default:e(()=>[t(V,null,{default:e(()=>[t(k,{to:"/"},{default:e(()=>[l("Home")]),_:1})]),_:1}),t(q,null,{default:e(()=>[l(" / ")]),_:1}),t(V,null,{default:e(()=>[t(k,{to:"/mqtt-roles"},{default:e(()=>[l(" MQTT Roles ")]),_:1})]),_:1}),t(q,null,{default:e(()=>[l(" / ")]),_:1}),t(V,null,{default:e(()=>[t(k,{to:"/mqtt-roles-details?id"+s.$route.query.id},{default:e(()=>[l(" Role Details ")]),_:1},8,["to"])]),_:1})]),_:1})]),_:1}),t(d,{cols:"12"},{default:e(()=>[t(b,{title:"MQTT role details"},{default:e(()=>[t(x,null,{default:e(()=>[t(f,{style:{"margin-top":"2px"}},{default:e(()=>[t(d,{cols:"12",md:"6"},{default:e(()=>[t(f,null,{default:e(()=>[t(d,{cols:"12",md:"6"},{default:e(()=>[U]),_:1}),t(d,{cols:"12",md:"6"},{default:e(()=>[l(y(a.item.name),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(d,{cols:"12",md:"6"},{default:e(()=>[Y]),_:1}),t(d,{cols:"12",md:"6"},{default:e(()=>[l(y(a.item.description),1)]),_:1})]),_:1})]),_:1}),t(d,{cols:"12",md:"6"},{default:e(()=>[t(f,null,{default:e(()=>[t(d,{cols:"12",md:"6"},{default:e(()=>[I]),_:1}),t(d,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[l(y(c.formatDate(a.item.created_at)),1)]),_:1})]),_:1}),t(f,null,{default:e(()=>[t(d,{cols:"12",md:"6"},{default:e(()=>[F]),_:1}),t(d,{cols:"12",md:"6",class:"text-right"},{default:e(()=>[l(y(c.formatDate(a.item.updated_at)),1)]),_:1})]),_:1})]),_:1})]),_:1})]),_:1}),t(v,null,{default:e(()=>[t(p,{color:"secondary",variant:"tonal",onClick:c.cancel},{default:e(()=>[l(" Back to role list ")]),_:1},8,["onClick"]),t(C,{class:"border-opacity-0"}),t(p,{color:"primary",variant:"tonal",onClick:c.edit},{default:e(()=>[l(" Edit role properties ")]),_:1},8,["onClick"]),t(C,{class:"border-opacity-0"}),t(p,{color:"error",variant:"tonal",onClick:c.deleteRole},{default:e(()=>[l(" Delete role ")]),_:1},8,["onClick"])]),_:1})]),_:1}),t(b,{title:"Assigned permissions",style:{"margin-top":"10px"}},{default:e(()=>[(r(!0),A(Q,null,E(a.item.role_permissions,i=>(r(),n(f,null,{default:e(()=>[t(d,{cols:"12",md:"12"},{default:e(()=>[t(x,null,{default:e(()=>[t(O,null,{default:e(()=>[t(M,{style:{"margin-left":"10px"}},{default:e(()=>[h("b",null,y(i.permissions.topic.toUpperCase()),1)]),_:2},1024),t(C),t(p,{icon:"",color:"#F05635"},{default:e(()=>[t(D,{onClick:g=>c.deleteWarning(i.permissions)},{default:e(()=>[l("mdi-delete")]),_:2},1032,["onClick"])]),_:2},1024)]),_:2},1024),t(S,{modelValue:a.deletePermission,"onUpdate:modelValue":o[2]||(o[2]=g=>a.deletePermission=g),width:"auto"},{default:e(()=>[t(b,null,{default:e(()=>[t(P,null,{default:e(()=>[l(" Are you sure that you want to remove the permission : "+y(a.selectedPermissionToDelete.topic)+" ? ",1)]),_:1}),t(v,null,{default:e(()=>[t(p,{color:"alert",onClick:o[0]||(o[0]=g=>c.deleteAssignment())},{default:e(()=>[l("Remove role")]),_:1}),t(p,{color:"secondary",onClick:o[1]||(o[1]=g=>{a.deletePermission=!1,a.selectedPermissionToDelete={}})},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:2},1024),t(P,null,{default:e(()=>[t(f,null,{default:e(()=>[t(d,{cols:"12",md:"12"},{default:e(()=>[i.permissions.publish_allowed==!0?(r(),n(m,{key:0,variant:"outlined",pill:"",color:"success"},{default:e(()=>[l(" Publish ")]),_:1})):u("",!0),i.permissions.publish_allowed==!1?(r(),n(m,{key:1,variant:"outlined",pill:"",color:"error"},{default:e(()=>[l(" Publish ")]),_:1})):u("",!0),i.permissions.subscribe_allowed==!0?(r(),n(m,{key:2,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Subscribe ")]),_:1})):u("",!0),i.permissions.subscribe_allowed==!1?(r(),n(m,{key:3,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Subscribe ")]),_:1})):u("",!0),i.permissions.retained_msgs_allowed==!0?(r(),n(m,{key:4,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Retain ")]),_:1})):u("",!0),i.permissions.retained_msgs_allowed==!1?(r(),n(m,{key:5,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Retain ")]),_:1})):u("",!0),i.permissions.qos_0_allowed==!0?(r(),n(m,{key:6,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 0 ")]),_:1})):u("",!0),i.permissions.qos_0_allowed==!1?(r(),n(m,{key:7,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 0 ")]),_:1})):u("",!0),i.permissions.qos_1_allowed==!0?(r(),n(m,{key:8,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 1 ")]),_:1})):u("",!0),i.permissions.qos_1_allowed==!1?(r(),n(m,{key:9,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 1 ")]),_:1})):u("",!0),i.permissions.qos_2_allowed==!0?(r(),n(m,{key:10,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 2 ")]),_:1})):u("",!0),i.permissions.qos_2_allowed==!1?(r(),n(m,{key:11,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" QOS 2 ")]),_:1})):u("",!0),i.permissions.shared_sub_allowed==!0?(r(),n(m,{key:12,variant:"outlined",pill:"",color:"success",style:{"margin-left":"10px"}},{default:e(()=>[l(" Shared ")]),_:1})):u("",!0),i.permissions.shared_sub_allowed==!1?(r(),n(m,{key:13,variant:"outlined",pill:"",color:"error",style:{"margin-left":"10px"}},{default:e(()=>[l(" Shared ")]),_:1})):u("",!0)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024)]),_:2},1024))),256)),t(f,null,{default:e(()=>[t(d,null,{default:e(()=>[t(x,null,{default:e(()=>[t(p,{variant:"outlined",size:"small",onClick:o[3]||(o[3]=i=>c.loadPermissions())},{default:e(()=>[l(" Assign new permission ")]),_:1}),t(S,{modelValue:a.addPermission,"onUpdate:modelValue":o[6]||(o[6]=i=>a.addPermission=i),width:"auto"},{default:e(()=>[t(b,null,{default:e(()=>[t(P,null,{default:e(()=>[l(" Pick the permission to assign to role ")]),_:1}),t(P,null,{default:e(()=>[t(z,{modelValue:a.selectedPermission,"onUpdate:modelValue":o[4]||(o[4]=i=>a.selectedPermission=i),items:a.permissions,"item-title":"topic","item-value":"id","return-object":!0,variant:"outlined",placeholder:"selectedRole",hint:`Publish : ${a.selectedPermission.publish_allowed} - Subscribe : ${a.selectedPermission.subscribe_allowed}`},null,8,["modelValue","items","hint"])]),_:1}),t(v,null,{default:e(()=>[t(p,{color:"primary",onClick:c.assignPermission},{default:e(()=>[l("Assign permission")]),_:1},8,["onClick"]),t(p,{color:"secondary",onClick:o[5]||(o[5]=i=>a.addPermission=!1)},{default:e(()=>[l("Cancel")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})]),_:1})}const se=T(L,[["render",W]]);export{se as default};
