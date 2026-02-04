export class Variable {
    key: string;
    value: string;
    constructor(key: string, value: string) {
        this.key = key
        this.value = value
    }
}

export const defaultVariables = [
    new Variable("version", "1.4.7"),
    new Variable("version_ascii", `\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ########## `), // https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole
    new Variable("ascii_gen", "https://patorjk.com/software/taag/"),
    new Variable("branch", "stable-ts")
]