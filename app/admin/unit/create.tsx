import { Create, NumberInput, ReferenceInput, SimpleForm, TextInput, required } from 'react-admin';

export const UnitCreate = () => {
    return (
        <Create>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "title"
                    validate = {[required()]}
                    label = "Title"
                />
                <TextInput
                    source = "description"
                    validate = {[required()]}
                    label = "Description"
                />
                <ReferenceInput
                    source = "courseId"
                    reference = "courses"
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