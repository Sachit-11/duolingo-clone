import { Edit, NumberInput, ReferenceInput, SimpleForm, TextInput, required, SelectInput } from 'react-admin';

export const ChallengeEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "question"
                    validate = {[required()]}
                    label = "Question"
                />
                <SelectInput
                    source = "type"
                    choices = {[
                        {
                            id: "SELECT",
                            name: "SELECT",
                        },
                        {
                            id: "ASSIST",
                            name: "ASSIST",
                        },
                    ]}
                    validate = {[required()]}
                />
                <ReferenceInput
                    source = "lessonId"
                    reference = "lessons"
                />
                <NumberInput
                    source = "order"
                    validate = {[required()]}
                    label = "Order"
                />
            </SimpleForm>
        </Edit>
    );
};