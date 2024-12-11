import { Create, NumberInput, ReferenceInput, SimpleForm, TextInput, required } from 'react-admin';

export const LessonCreate = () => {
    return (
        <Create>
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
        </Create>
    );
};