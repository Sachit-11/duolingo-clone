import { Create, ReferenceInput, SimpleForm, TextInput, required, BooleanInput } from 'react-admin';

export const ChallengeOptionCreate = () => {
    return (
        <Create>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "text"
                    validate = {[required()]}
                    label = "Text"
                />
                <BooleanInput
                    source = "correct"
                    label = "Correct option"
                />
                <ReferenceInput
                    source = "challengeId"
                    reference = "challenges"
                />
                <TextInput
                    source = "imageSrc"
                    label = "ImageSrc"
                />
                <TextInput
                    source = "audioSrc"
                    label = "AudioSrc"
                />
            </SimpleForm>
        </Create>
    );
};