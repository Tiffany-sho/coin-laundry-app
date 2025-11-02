import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Popover,
  Portal,
  Stack,
  NumberInput,
} from "@chakra-ui/react";
import { useCoinLaundryForm } from "../../context/CoinlaundryForm/CoinLaundryFormContext";

const PropoverForm = () => {
  const [open, setOpen] = useState(false);
  const { dispatch } = useCoinLaundryForm();
  const [newMachine, setNewMachine] = useState({
    name: "",
    num: 0,
  });

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)} modal>
      <Popover.Trigger asChild>
        <Button w="20%" size="xs" m="3%" variant="outline">
          追加
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>機械名</Field.Label>
                  <Input
                    placeholder="機械名"
                    onChange={(e) =>
                      setNewMachine((prev) => {
                        return { ...prev, name: e.target.value };
                      })
                    }
                    value={newMachine.name}
                  />
                </Field.Root>
                <Button
                  onClick={() => {
                    dispatch({ type: "ADD_MACHINES", payload: { newMachine } });
                    setNewMachine({
                      name: "",
                      num: 0,
                    });
                    setOpen(false);
                  }}
                >
                  追加
                </Button>
              </Stack>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default PropoverForm;
