import { Edit, NumberInput, ReferenceInput, SimpleForm, TextInput, required } from 'react-admin';

export const LessonEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "title"
                    validate = {[required()]}
                    label = "Title"
                />
                <ReferenceInput
                    source = "unitId"
                    reference = "units"
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