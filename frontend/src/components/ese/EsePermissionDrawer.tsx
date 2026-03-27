import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerPositioner,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseTrigger,
  DrawerTitle,
} from "@chakra-ui/react";
import type {
  CreateMqttPermissionRequest,
  CreateStringPermissionRequest,
  MqttPermission,
  StringPermission,
} from "../../api/types";

type AnyPermission = MqttPermission | StringPermission;

function isMqttPerm(p: AnyPermission): p is MqttPermission {
  return "topic" in p;
}

interface EsePermissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMqtt?: (data: CreateMqttPermissionRequest) => void;
  onSaveString?: (data: CreateStringPermissionRequest) => void;
  domain: string;
  isSaving?: boolean;
  permission?: AnyPermission | null;
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Flex as="label" align="center" gap="2" cursor="pointer" userSelect="none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Text fontSize="sm">{label}</Text>
    </Flex>
  );
}

export function EsePermissionDrawer({
  isOpen,
  onClose,
  onSaveMqtt,
  onSaveString,
  domain,
  isSaving = false,
  permission,
}: EsePermissionDrawerProps) {
  const isMqtt = domain === "mqtt";
  const isEdit = !!permission;

  // MQTT fields
  const [topic, setTopic] = useState("");
  const [publishAllowed, setPublishAllowed] = useState(false);
  const [subscribeAllowed, setSubscribeAllowed] = useState(false);
  const [qos0Allowed, setQos0Allowed] = useState(true);
  const [qos1Allowed, setQos1Allowed] = useState(true);
  const [qos2Allowed, setQos2Allowed] = useState(true);
  const [retainedMsgsAllowed, setRetainedMsgsAllowed] = useState(false);
  const [sharedSubAllowed, setSharedSubAllowed] = useState(false);
  const [sharedGroup, setSharedGroup] = useState("");

  // String fields
  const [permissionString, setPermissionString] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (permission && isMqttPerm(permission)) {
        setTopic(permission.topic);
        setPublishAllowed(permission.publishAllowed);
        setSubscribeAllowed(permission.subscribeAllowed);
        setQos0Allowed(permission.qos0Allowed);
        setQos1Allowed(permission.qos1Allowed);
        setQos2Allowed(permission.qos2Allowed);
        setRetainedMsgsAllowed(permission.retainedMsgsAllowed);
        setSharedSubAllowed(permission.sharedSubAllowed);
        setSharedGroup(permission.sharedGroup ?? "");
      } else if (permission && !isMqttPerm(permission)) {
        setPermissionString(permission.permissionString);
        setDescription(permission.description ?? "");
      } else {
        setTopic("");
        setPublishAllowed(false);
        setSubscribeAllowed(false);
        setQos0Allowed(true);
        setQos1Allowed(true);
        setQos2Allowed(true);
        setRetainedMsgsAllowed(false);
        setSharedSubAllowed(false);
        setSharedGroup("");
        setPermissionString("");
        setDescription("");
      }
    }
  }, [isOpen, permission]);

  const handleSubmit = () => {
    if (isMqtt && onSaveMqtt) {
      onSaveMqtt({
        topic,
        publishAllowed,
        subscribeAllowed,
        qos0Allowed,
        qos1Allowed,
        qos2Allowed,
        retainedMsgsAllowed,
        sharedSubAllowed,
        sharedGroup: sharedGroup || undefined,
      });
    } else if (!isMqtt && onSaveString) {
      onSaveString({
        permissionString,
        description: description || undefined,
      });
    }
  };

  const canSave = isMqtt ? topic.trim() !== "" : permissionString.trim() !== "";

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} placement="end" size="md">
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? "Edit Permission" : "Create Permission"}</DrawerTitle>
          </DrawerHeader>
          <DrawerCloseTrigger />
          <DrawerBody>
            {isMqtt ? (
              <VStack gap="4" align="stretch">
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="1">Topic</Text>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. devices/+/telemetry"
                    fontFamily="mono"
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="2">Flags</Text>
                  <VStack gap="2" align="stretch">
                    <CheckboxField label="Publish Allowed" checked={publishAllowed} onChange={setPublishAllowed} />
                    <CheckboxField label="Subscribe Allowed" checked={subscribeAllowed} onChange={setSubscribeAllowed} />
                    <CheckboxField label="QoS 0 Allowed" checked={qos0Allowed} onChange={setQos0Allowed} />
                    <CheckboxField label="QoS 1 Allowed" checked={qos1Allowed} onChange={setQos1Allowed} />
                    <CheckboxField label="QoS 2 Allowed" checked={qos2Allowed} onChange={setQos2Allowed} />
                    <CheckboxField label="Retained Messages Allowed" checked={retainedMsgsAllowed} onChange={setRetainedMsgsAllowed} />
                    <CheckboxField label="Shared Subscription Allowed" checked={sharedSubAllowed} onChange={setSharedSubAllowed} />
                  </VStack>
                </Box>

                {sharedSubAllowed && (
                  <Box>
                    <Text fontWeight="medium" fontSize="sm" mb="1">Shared Group</Text>
                    <Input
                      value={sharedGroup}
                      onChange={(e) => setSharedGroup(e.target.value)}
                      placeholder="Group name (optional)"
                    />
                  </Box>
                )}
              </VStack>
            ) : (
              <VStack gap="4" align="stretch">
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="1">Permission String</Text>
                  <Input
                    value={permissionString}
                    onChange={(e) => setPermissionString(e.target.value)}
                    placeholder="e.g. HIVEMQ_SUPER_ADMIN"
                    fontFamily="mono"
                  />
                </Box>

                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb="1">Description</Text>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                  />
                </Box>
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Flex gap="3" w="full" justify="flex-end">
              <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                colorPalette="yellow"
                onClick={handleSubmit}
                disabled={!canSave}
                loading={isSaving}
              >
                {isEdit ? "Update" : "Create"}
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  );
}
