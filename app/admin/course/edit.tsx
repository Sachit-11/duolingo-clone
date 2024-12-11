import { Edit, SimpleForm, TextInput, required } from 'react-admin';

export const CourseEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "id"
                    validate = {[required()]}
                    label = "Id"
                />
                <TextInput
                    source = "title"
                    validate = {[required()]}
                    label = "Title"
                />
                <TextInput
                    source = "imageSrc"
                    validate = {[required()]}
                    label = "Image Source"
                />
            </SimpleForm>
        </Edit>
    );
};