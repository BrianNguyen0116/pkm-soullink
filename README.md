# [Pokemon Soul Link Tool](https://briannguyen0116.github.io/pkm-soullink/)

![Picture of a wooper for dopamine.](https://archives.bulbagarden.net/media/upload/thumb/f/f7/0194Wooper.png/250px-0194Wooper.png)

Have a friend to play pokemon? Must be nice, here's a tool to make your lives easier. The features of the website include:

* Pokemon Inventory Tracking and Visualizer
* Valid Team-Combination Generation
* Pokemon Type Coverage

This is only useful for you if you're following the __no same primary type__ rule. The tool is made using only basic Javascript without any external libraries to be used on any device (the logic wouldn't need one anyways). You can visit the site [here](https://briannguyen0116.github.io/pkm-soullink/).

## 📝 Instructions


### PC Management
To use the tool, you need to properly track the pokemon. It isn't too much assuming the user knows what a __JSON__ is.

* There are two object arrays: PC_1 and PC_2.
* Each object carries a _name_ and _type_.
    * The name is the shared nickname between you and your friend's pokemon.
    * The type is, you guessed it, the pokemon type.

Here is what is prepared when you visit the site:

```
[
    {
        "nickname": "Cool Guy",
        "name1": "Wooper",
        "name2": "Beldum",
        "type1": "Water",
        "type2": "Steel",
        "area": "Route 212"
    }
]
```

There are two ways to modify your PCs.
1. If you __love JSON__, you can write to an external json file separately while you're having fun and upload it using the ```Upload JSON``` button.
2. If you __hate JSON__, you can use the site form and save the file for future use through the ```Save as JSON``` button.


### The Actual Use

Once the team has been prepared, click ```Run``` and feel free to select pokemons you would like to prioritize. Each combination produced can be clicked to show a summary of the different teams and their coverage.

There isn't much else, the tool is intended to be simple and you can modify the code however you'd like.
