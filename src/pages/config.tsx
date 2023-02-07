import { withAuthorization } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { NextPage } from "next";
import { AppContainer } from "../modules/ui/AppContainer";
import { Input } from "../modules/ui/Input";

const ConfigPage: NextPage = () => {
  return (
    <AppContainer>
      <Box
        as="form"
        onSubmit={(e) => e.preventDefault()}
        display="flex"
        flexDirection="column"
        gap={8}
        borderColor="neutralDefault"
        borderWidth={1}
      >
        <Text variant="heading">Payment Provider settings</Text>

        <Input label="API_KEY" />

        <div>
          <Button>Save</Button>
        </div>
      </Box>
    </AppContainer>
  );
};

export default withAuthorization()(ConfigPage);
